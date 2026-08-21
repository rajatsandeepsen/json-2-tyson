import { z } from "zod";
import { schemaToType } from "./core";
import { BaseSchemaNodeZod } from "./type";
import { getComment, toTypeName } from "./utils";

const ToolFunctionZod = z.object({
	name: z.string().default("Tool"),
	description: z.string().trim().optional(),
	async: z.boolean().default(false),
	parameters: BaseSchemaNodeZod.optional(),
	returns: BaseSchemaNodeZod.optional(),
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
		function: { name: defaultName, parameters, async, returns, description },
	} = ToolSchemaZod.parse(input);

	const ps = options.paramStyle ?? "inline";
	const rs = options.returnStyle ?? "inline";

	const name = toTypeName(options.name ?? defaultName);

	const baseParamType = parameters
		? schemaToType(parameters, { objectStyle: ps })
		: null;

	const params = baseParamType ? `params: ${baseParamType}` : null;

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
		parameterType: baseParamType,
		returnType: baseReturnType,
		comment: description,
	};
}
