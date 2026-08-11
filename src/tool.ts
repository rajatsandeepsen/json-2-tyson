import { z } from "zod";
import { schemaToType } from "./core";
import { BaseSchemaNodeZod } from "./type";
import { formatObjectFields } from "./utils";

const ToolFunctionZod = z.object({
	name: z
		.string()
		.transform((n) => n.replace(/[^A-Za-z0-9_$]/g, "_"))
		.refine((n) => /^[A-Za-z_$]/.test(n)),
	description: z.string().trim().optional(),
	async: z.boolean().default(false),
	parameters: z
		.record(
			z.string().refine((k) => /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k)),
			BaseSchemaNodeZod,
		)
		.default({}),
	returns: BaseSchemaNodeZod.optional(),
	required: z.array(z.string()).default([]),
	additionalProperties: z.boolean().default(false),
});

const ToolSchemaZod = z.object({
	type: z.literal("function"),
	function: ToolFunctionZod,
});

export type ToolSchema = z.infer<typeof ToolSchemaZod>;

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
			name,
			parameters,
			async,
			returns,
			description,
			additionalProperties,
			required,
		},
	} = ToolSchemaZod.parse(input);

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

	const comment = options.comment && description ? `// ${description}\n` : "";

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
