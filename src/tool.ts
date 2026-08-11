import { schemaToType } from "./core";
import type { BaseSchemaNode } from "./type";
import {
	escapePropertyName,
	formatObjectFields,
	isObjectLike,
	toToolName,
} from "./utils";

type SchemaNode = BaseSchemaNode;

type ToolFunction = {
	name?: string;
	description?: string;
	async?: boolean;
	parameters?: unknown;
	returns?: unknown;
	required?: string[];
	additionalProperties?: boolean | unknown;
};

export type ToolSchema = {
	type: string;
	function: ToolFunction;
};

function extractParametersShape(toolFunction: ToolFunction) {
	const raw = toolFunction.parameters;

	if (!isObjectLike(raw)) {
		return {
			properties: {} as Record<string, unknown>,
			required: new Set<string>(),
			additionalProperties: false as boolean | unknown,
		};
	}

	const asSchema = raw as SchemaNode;

	if (asSchema.type === "object" || asSchema.properties !== undefined) {
		return {
			properties: isObjectLike(asSchema.properties)
				? asSchema.properties
				: ({} as Record<string, unknown>),
			required: new Set(
				Array.isArray(asSchema.required) ? asSchema.required : [],
			),
			additionalProperties:
				asSchema.additionalProperties ??
				toolFunction.additionalProperties ??
				false,
		};
	}

	return {
		properties: raw as Record<string, unknown>,
		required: new Set(
			Array.isArray(toolFunction.required) ? toolFunction.required : [],
		),
		additionalProperties: toolFunction.additionalProperties ?? false,
	};
}

export function getToolSchema(
	input: Partial<ToolSchema>,
	options: {
		name?: string;
		export?: boolean;
		async?: boolean;
		comment?: boolean;
		paramStyle?: "inline" | "multiline";
		returnStyle?: "inline" | "multiline";
	} = {},
) {
	if (!isObjectLike(input)) {
		throw new Error("Invalid tool input: expected an object");
	}

	const toolFunction = input.function;

	if (!isObjectLike(toolFunction) || !toolFunction) {
		throw new Error("Invalid tool input: missing function object");
	}

	const schemaName =
		typeof toolFunction.name === "string" ? toolFunction.name : "tool";
	const name = toToolName(options.name ?? schemaName);

	const { properties, required, additionalProperties } =
		extractParametersShape(toolFunction);

	const fields: string[] = Object.entries(properties as object).map(
		([key, value]) => {
			const optional = required.has(key) ? "" : "?";
			const keyType = `${escapePropertyName(key)}${optional}`;
			const valueType = schemaToType(value, {
				objectStyle: options.paramStyle,
			});
			return `${keyType}: ${valueType}`;
		},
	);

	if (additionalProperties && additionalProperties !== false) {
		const valueType =
			additionalProperties === true
				? "unknown"
				: schemaToType(additionalProperties, {
						objectStyle: options.paramStyle,
					});
		fields.push(`[key: string]: ${valueType}`);
	}

	const parameterType = formatObjectFields(
		fields,
		options.paramStyle ?? "inline",
	);

	const async = options.async ?? toolFunction.async ?? false;
	const baseReturnType = toolFunction.returns
		? schemaToType(toolFunction.returns, { objectStyle: options.returnStyle })
		: "void";
	const returnType = async ? `Promise<${baseReturnType}>` : baseReturnType;

	const exportPrefix = options.export ? "export type" : "type";

	const comment =
		options.comment &&
		typeof toolFunction.description === "string" &&
		toolFunction.description.trim().length
			? `// ${toolFunction.description}\n`
			: "";

	return {
		code: `${comment}${exportPrefix} ${name} = (params: ${parameterType}) => ${returnType}`,
		name,
		async,
		parameterType,
		returnType: baseReturnType,
		comment,
	};
}
