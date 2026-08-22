import { z } from "zod";
import { getComment } from "./utils";

const JsonDataZod = z.union([
	z.null(),
	z.number(),
	z.string(),
	z.record(z.string(), z.unknown()),
	z.array(z.unknown()),
]);

export type JsonData = z.input<typeof JsonDataZod>;

export function getJsonCode(
	data: JsonData,
	options?: {
		comment?: string;
		return?: boolean;
		multiline?: boolean;
	},
) {
	const input = JsonDataZod.parse(data);
	const comment = options?.comment ? getComment(options.comment, "\n") : "";

	const returns = options?.return ? "return " : "";
	const post = options?.return ? ";" : "";

	let argumentString: string = "";

	if (typeof input === "object" || Array.isArray(input))
		argumentString = JSON.stringify(
			input,
			null,
			options?.multiline ? 2 : undefined,
		);
	else if (typeof input === "string") argumentString = input;
	else if (typeof input === "number") argumentString = input.toString();
	else argumentString = input;

	const code = `${comment}${returns}${argumentString}${post}`;
	return code;
}
