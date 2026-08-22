import { z } from "zod";
import { getComment } from "./utils";

const ToolCallZod = z.object({
	name: z.string(),
	arguments: z.union([
		z.null(),
		z.number(),
		z.string(),
		z.record(z.string(), z.unknown()),
		z.array(z.unknown()),
	]),
});

export type ToolCall = z.input<typeof ToolCallZod>;

export function getToolCallCode(
	data: ToolCall,
	options?: {
		parent?: string;
		comment?: string;
		return?: boolean;
		async?: boolean;
		multiline?: boolean;
	},
) {
	const input = ToolCallZod.parse(data);
	const comment = options?.comment ? getComment(options.comment, "\n") : "";

	const returns = options?.return ? "return " : "";
	const post = options?.return ? ";" : "";
	const async = options?.async ? "await " : "";
	const parent = options?.parent ? `${options.parent}.` : "";

	let argumentString: string = "";

	if (input.arguments) {
		if (typeof input.arguments === "object" || Array.isArray(input.arguments))
			argumentString = JSON.stringify(
				input.arguments,
				null,
				options?.multiline ? 2 : undefined,
			);
		else if (typeof input.arguments === "string")
			argumentString = input.arguments;
		else if (typeof input.arguments === "number")
			argumentString = input.arguments.toString();
		else argumentString = input.arguments;
	}

	const code = `${comment}${returns}${async}${parent}${input.name}(${argumentString})${post}`;
	return code;
}
