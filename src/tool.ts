import { z } from "zod";
import { schemaToType } from "./core";
import { BaseSchemaNodeZod, PropertiesZod } from "./type";
import {
	addTab,
	escapePropertyName,
	formatObjectFields,
	formatObjectFieldsWithComment,
	getComment,
	toTypeName,
} from "./utils";

const ToolFunctionZod = z.object({
	name: z.string().default("Tool"),
	description: z.string().trim().optional(),
	async: z.boolean().default(false),
	parameters: PropertiesZod.default({}),
	returns: BaseSchemaNodeZod.optional(),
	required: z.array(z.string()).default([]),
	additionalProperties: z.boolean().default(false),
});

const ToolSchemaZod = z.object({
	type: z.literal("function"),
	function: ToolFunctionZod,
});

export type ToolSchema = z.input<typeof ToolSchemaZod>;

export function getToolSchema(
	input: Partial<ToolSchema>,
	options: {
		name?: string;
		export?: boolean;
		async?: boolean;
		comment?: boolean;
		paramStyle?: "inline" | "multiline" | "comment";
		returnStyle?: "inline" | "multiline" | "comment";
	} = {},
) {
	const {
		function: {
			name: defaultName,
			parameters,
			async,
			returns,
			description,
			additionalProperties,
			required,
		},
	} = ToolSchemaZod.parse(input);

	const ps = options.paramStyle ?? "inline";
	const rs = options.returnStyle ?? "inline";

	const name = toTypeName(options.name ?? defaultName);
	const requiredSet = new Set(required);

	const fields = Object.entries(parameters).map(([key, value]) => {
		const newKey = escapePropertyName(key);
		const optional = requiredSet.has(key) ? "" : "?";
		const keyType = `${newKey}${optional}`;

		const valueType = schemaToType(value, {
			objectStyle: options.paramStyle,
		});

		return {
			key: `${keyType}: ${valueType}`,
			comment: value.description,
		};
	});

	if (additionalProperties) {
		fields.push({ key: `[key: string]: unknown`, comment: undefined });
	}

	const parameterType =
		ps === "comment"
			? formatObjectFieldsWithComment(fields)
			: formatObjectFields(fields, ps);

	const params =
		fields.length > 0
			? `params: ${ps === "inline" ? parameterType : addTab(parameterType)}`
			: null;

	const baseReturnType = returns
		? schemaToType(returns, { objectStyle: rs })
		: "void";

	const isAsync = options.async === undefined ? async : options.async;
	const returnType = isAsync ? `Promise<${baseReturnType}>` : baseReturnType;

	const exportPrefix = options.export ? "export type" : "type";

	const comment = options.comment ? getComment(description, "\n") : "";

	const code = `${comment}${exportPrefix} ${name} = (${params ?? ""}) => ${returnType}`;

	return {
		code,
		name,
		async: isAsync,
		parameterType,
		returnType: baseReturnType,
		comment: description,
	};
}
