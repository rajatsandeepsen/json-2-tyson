import type { BaseSchemaNode } from "./type";
import {
	escapePropertyName,
	isObjectLike,
	literal,
	primitiveTypeMap,
} from "./utils";

type SchemaToTypeOptions = {
	objectStyle?: "inline" | "multiline";
	filterProperty?: (key: string) => boolean;
};

export function formatObjectFields(
	fields: string[],
	objectStyle: "inline" | "multiline",
) {
	if (objectStyle === "multiline") {
		return `{
${fields.map((field) => `  ${field}`).join(",\n")}
}`;
	}

	return `{ ${fields.join(", ")} }`;
}

export function schemaToType(
	schema: unknown,
	options: SchemaToTypeOptions = {},
) {
	const objectStyle = options.objectStyle ?? "inline";
	const filterProperty = options.filterProperty ?? (() => true);

	function parse(node: unknown): string {
		if (Array.isArray(node)) {
			if (node.length === 0) return "unknown[]";
			const elementTypes = Array.from(new Set(node.map((item) => parse(item))));
			return `(${elementTypes.join(" | ")})[]`;
		}

		if (!isObjectLike(node)) {
			return "unknown";
		}

		const s = node as BaseSchemaNode;

		if (s.const !== undefined) {
			return literal(s.const);
		}

		if (Array.isArray(s.enum) && s.enum.length > 0) {
			return s.enum.map((item) => literal(item)).join(" | ");
		}

		if (Array.isArray(s.oneOf) && s.oneOf.length > 0) {
			return s.oneOf.map((item) => parse(item)).join(" | ");
		}

		if (Array.isArray(s.anyOf) && s.anyOf.length > 0) {
			return s.anyOf.map((item) => parse(item)).join(" | ");
		}

		if (Array.isArray(s.allOf) && s.allOf.length > 0) {
			return s.allOf.map((item) => parse(item)).join(" & ");
		}

		if (Array.isArray(s.type)) {
			const types = s.type.map((t) => primitiveTypeMap[t] ?? "unknown");
			return Array.from(new Set(types)).join(" | ");
		}

		if (s.type === "array" || s.items !== undefined) {
			if (Array.isArray(s.items)) {
				const tupleItems = s.items.map((item) => parse(item)).join(", ");
				return `[${tupleItems}]`;
			}

			const itemType = s.items === undefined ? "unknown" : parse(s.items);
			return `${itemType}[]`;
		}

		if (s.type === "object" || s.properties !== undefined) {
			const properties = isObjectLike(s.properties) ? s.properties : {};
			const required = new Set(Array.isArray(s.required) ? s.required : []);

			const fields = Object.entries(properties as object)
				.filter(([key]) => filterProperty(key))
				.map(([key, value]) => {
					const optional = required.has(key) ? "" : "?";
					return `${escapePropertyName(key)}${optional}: ${parse(value)}`;
				});

			if (s.additionalProperties && s.additionalProperties !== false) {
				const valueType =
					s.additionalProperties === true
						? "unknown"
						: parse(s.additionalProperties);
				fields.push(`[key: string]: ${valueType}`);
			}

			if (fields.length === 0) {
				return "{ }";
			}

			return formatObjectFields(fields, objectStyle);
		}

		if (typeof s.type === "string") {
			return primitiveTypeMap[s.type] ?? "unknown";
		}

		return "unknown";
	}

	return parse(schema);
}
