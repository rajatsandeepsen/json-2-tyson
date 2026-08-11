import { z } from "zod";
import { schemaToType } from "./core";
import { BaseSchemaNodeZod, propertyKeys } from "./type";
import { formatObjectFields, getComment, toTypeName } from "./utils";

const ToolFunctionZod = z.object({
	name: z.string().default("Tool"),
	description: z.string().trim().optional(),
	async: z.boolean().default(false),
	parameters: z.record(propertyKeys, BaseSchemaNodeZod).default({}),
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
		paramStyle?: "inline" | "multiline";
		returnStyle?: "inline" | "multiline";
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

	const name = toTypeName(options.name ?? defaultName);
	const requiredSet = new Set(required);

	const fields: string[] = Object.entries(parameters).map(([key, value]) => {
		const optional = requiredSet.has(key) ? "" : "?";
		const keyType = `${key}${optional}`;
		const valueType = schemaToType(value, {
			objectStyle: options.paramStyle,
		});
		return `${keyType}: ${valueType}`;
	});

	if (additionalProperties) {
		fields.push(`[key: string]: unknown`);
	}

	const parameterType = formatObjectFields(
		fields,
		options.paramStyle ?? "inline",
	);

	const baseReturnType = returns
		? schemaToType(returns, { objectStyle: options.returnStyle })
		: "void";

	const returnType =
		options.async || async ? `Promise<${baseReturnType}>` : baseReturnType;

	const exportPrefix = options.export ? "export type" : "type";

	const comment = options.comment ? getComment(description, "\n") : "";

	const code = `${comment}${exportPrefix} ${name} = (params: ${parameterType}) => ${returnType}`;

	return {
		code,
		name,
		async,
		parameterType,
		returnType: baseReturnType,
		comment,
	};
}
