import type { JsonValue } from "./type";

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
	return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name) ? name : JSON.stringify(name);
}

export function literal(value: JsonValue) {
	return JSON.stringify(value);
}

export function toTypeName(name: string) {
	const safe = name.replace(/[^a-zA-Z0-9_]+/g, " ").trim();
	const parts = safe.split(/\s+/).filter(Boolean);
	const pascal = parts
		.map((part) => part[0].toUpperCase() + part.slice(1))
		.join("");
	return pascal || "GeneratedType";
}

export function toToolName(name: string) {
	const normalized = name.replace(/[^A-Za-z0-9_$]/g, "_");
	if (/^[A-Za-z_$]/.test(normalized)) return normalized;
	return `_${normalized || "tool"}`;
}

export function formatObjectFields(
	fields: string[],
	objectStyle: "inline" | "multiline",
) {
	if (objectStyle === "multiline") {
		if (fields.length === 0) return "{ }";

		return `{\n${fields.map((field) => `  ${field}`).join(",\n")}\n}`;
	}

	return `{ ${fields.join(", ")} }`;
}
