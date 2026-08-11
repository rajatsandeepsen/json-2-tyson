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
	fields: string[],
	objectStyle: "inline" | "multiline",
) {
	if (objectStyle === "multiline") {
		if (fields.length === 0) return "{ }";

		const content = fields.map((field) => `  ${field}`).join(",\n");

		return `{\n${content}\n}`;
	}

	return `{ ${fields.join(", ")} }`;
}

export function formatObjectFieldsWithComment(
	fields: { key: string; comment?: string }[],
) {
	if (fields.length === 0) return "{ }";

	const content = fields
		.map((f) => {
			const post = f.comment ? `, // ${f.comment}` : ",";
			return `  ${f.key}${post}`;
		})
		.join("\n");

	return `{\n${content}\n}`;
}

export const getComment = (description?: string, post?: string) =>
	description && description.trim().length > 0
		? `// ${description}${post ?? ""}`
		: ``;
