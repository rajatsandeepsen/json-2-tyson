import { checkKey } from "./type";
import { addTab, getComment } from "./utils";

type Input = {
	name: string;
	comment?: string;
}[];

export function getObject(
	name: string,
	input: Input,
	options: {
		declare?: string;
		comment?: string;
		export?: boolean;
		inline?: boolean;
		raw?: boolean;
	} = {},
) {
	const list = input
		.map((item, i, array) => {
			if (!checkKey(item.name)) throw Error("Wrong variable name");
			const keyPrefix = options.declare ? `${item.name}: ` : "";

			if (options.inline) return `${keyPrefix}${item.name}`;

			if (item.comment && item.comment.trim().length > 0)
				return `${keyPrefix}${item.name}, ${getComment(item.comment)}`;

			if (i === array.length - 1) return `${keyPrefix}${item.name}`;

			return `${keyPrefix}${item.name},`;
		})
		.join(options.inline ? ", " : "\n");

	let listCode: string;

	if (input.length === 0) listCode = "{ }";
	else if (options.inline) listCode = `{ ${list} }`;
	else listCode = `{\n${list}\n}`;

	if (options.raw) return listCode;

	const comment = options.comment ? getComment(options.comment, "\n") : "";

	if (options.declare) {
		const exportPrefix = options.export
			? "export declare const"
			: "declare const";
		const code = `${comment}${exportPrefix} ${name}: ${addTab(listCode)};`;
		return code;
	}

	const exportPrefix = options.export ? "export const" : "const";
	const code = `${comment}${exportPrefix} ${name} = ${addTab(listCode)};`;
	return code;
}

export function getArray(
	name: string,
	input: Input,
	options: {
		declare?: boolean;
		comment?: string;
		export?: boolean;
		inline?: boolean;
		raw?: boolean;
	} = {},
) {
	const list = input
		.map((item, i, array) => {
			if (!checkKey(item.name)) throw Error("Wrong variable name");

			const keyPrefix = options.declare ? `${item.name}: ` : "";

			if (options.inline) return `${keyPrefix}${item.name}`;

			if (item.comment && item.comment.trim().length > 0)
				return `${keyPrefix}${item.name}, ${getComment(item.comment)}`;

			if (i === array.length - 1) return `${keyPrefix}${item.name}`;

			return `${keyPrefix}${item.name},`;
		})
		.join(options.inline ? ", " : "\n");

	let listCode: string;

	if (input.length === 0) listCode = "[]";
	else if (options.inline) listCode = `[ ${list} ]`;
	else listCode = `[\n${list}\n]`;

	if (options.raw) return listCode;

	const comment = options.comment ? getComment(options.comment, "\n") : "";

	if (options.declare) {
		const exportPrefix = options.export
			? "export declare const"
			: "declare const";
		const code = `${comment}${exportPrefix} ${name}: ${addTab(listCode)};`;
		return code;
	}

	const exportPrefix = options.export ? "export const" : "const";
	const code = `${comment}${exportPrefix} ${name} = ${addTab(listCode)};`;
	return code;
}

export function getDeclare(
	name: string,
	input: string,
	options: {
		declare?: boolean;
		comment?: string;
		export?: boolean;
		inline?: boolean;
		raw?: boolean;
	},
) {
	const comment = options.comment ? getComment(options.comment, "\n") : "";

	const exportPrefix = options.export
		? "export declare const"
		: "declare const";

	const code = `${comment}${exportPrefix} ${name}: ${addTab(input)};`;
	return code;
}
