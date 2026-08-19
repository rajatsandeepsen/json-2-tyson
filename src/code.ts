import type { getToolSchema } from "./tool";
import { checkKey } from "./type";
import { addTab, getComment } from "./utils";

export function getObject(
	name: string,
	input: Pick<ReturnType<typeof getToolSchema>, "name" | "comment">[],
	options: {
		comment?: string;
		export?: boolean;
		inline?: boolean;
	} = {},
) {
	const list = input
		.map((item, i, array) => {
			if (!checkKey(item.name)) throw Error("Wrong variable name");
			if (options.inline) return item.name;

			if (item.comment && item.comment.trim().length > 0)
				return `${item.name}, ${item.comment}`;

			if (i === array.length - 1) return item.name;

			return `${item.name},`;
		})
		.join(options.inline ? ", " : "\n");

	let listCode: string;

	if (input.length === 0) listCode = "{ };";
	else if (options.inline) listCode = `{ ${list} };`;
	else listCode = `{\n${list}\n};`;

	const exportPrefix = options.export ? "export const" : "const";
	const comment = options.comment ? getComment(options.comment, "\n") : "";
	const code = `${comment}${exportPrefix} ${name} = ${addTab(listCode)}`;
	return code;
}
