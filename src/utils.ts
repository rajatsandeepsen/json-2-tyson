import { z } from "zod";

import { type JsonValue, propertyKeys } from "./type";

export const primitiveTypeMap: Record<string, string> = {
	string: "string",
	number: "number",
	integer: "number",
	boolean: "boolean",
	null: "null",
};

export function isObjectLike(value: unknown) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function escapePropertyName(name: string) {
	return propertyKeys.parse(name);
}

export function literal(value: JsonValue) {
	return JSON.stringify(value);
}

export function toTypeName(name: string) {
	return z
		.string()
		.transform((n) => n.replace(/[^A-Za-z0-9_$]/g, "_"))
		.refine((n) => /^[A-Za-z_$]/.test(n))
		.parse(name);
}

export function formatObjectFields(
	fields: { key: string }[],
	objectStyle: "inline" | "multiline",
) {
	if (fields.length === 0) return "{ }";

	if (objectStyle === "multiline") {
		const content = fields.map((field) => `${field.key};`).join("\n");

		return `{\n${content}\n}`;
	}

	return `{ ${fields.map((f) => f.key).join(", ")} }`;
}

export function formatObjectFieldsWithComment(
	fields: { key: string; comment?: string }[],
) {
	if (fields.length === 0) return "{ }";

	const content = fields
		.map((f) => {
			const post = f.comment ? `; // ${f.comment}` : ";";
			return `${f.key}${post}`;
		})
		.join("\n");

	return `{\n${content}\n}`;
}

export const getComment = (description?: string, post?: string) =>
	description && description.trim().length > 0
		? `// ${description}${post ?? ""}`
		: ``;

export function addTab(input: string, n: number = 1, tab = "  ") {
	if (n <= 0) return input;

	const tabs = tab.repeat(n);
	const LastTabs = tab.repeat(n - 1);

	return input
		.split("\n")
		.map((part, i, arr) => {
			if (i === arr.length - 2) return `${part}\n${LastTabs}`;
			if (i < arr.length - 1) return `${part}\n${tabs}`;
			return part;
		})
		.join("");
}
