import { PropertiesZod, BaseSchemaNodeZod as SchemaNodeZod } from "./type";
import {
	addTab,
	escapePropertyName,
	formatObjectFields,
	formatObjectFieldsWithComment,
	literal,
	primitiveTypeMap,
} from "./utils";

export type SchemaToTypeOptions = {
	objectStyle?: "inline" | "multiline" | "comment";
	filterProperty?: (key: string) => boolean;
	tabSize?: number;
};

export { formatObjectFields } from "./utils";

export function schemaToType(
	schema: unknown,
	options: SchemaToTypeOptions = {},
) {
	const tabSize = options.tabSize ?? 1;
	const objectStyle = options.objectStyle ?? "inline";
	const filterProperty = options.filterProperty ?? (() => true);

	function parse(node: unknown): string {
		if (Array.isArray(node)) {
			if (node.length === 0) return "unknown[]";
			const elementTypes = Array.from(new Set(node.map((item) => parse(item))));
			return `(${elementTypes.join(" | ")})[]`;
		}

		const parsed = SchemaNodeZod.safeParse(node);
		if (!parsed.success) {
			return "unknown";
		}

		const s = parsed.data;

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
			const properties = PropertiesZod.safeParse(s.properties ?? {});

			if (!properties.success) {
				return "unknown";
			}

			const required = new Set(s.required);

			const fields = Object.entries(properties.data)
				.filter(([key]) => filterProperty(key))
				.map(([key, value]) => {
					const optional = required.has(key) ? "" : "?";
					const valueType = addTab(parse(value), tabSize);
					return {
						key: `${escapePropertyName(key)}${optional}: ${valueType}`,
						comment: value.description,
					};
				});

			if (s.additionalProperties && s.additionalProperties !== false) {
				const valueType =
					s.additionalProperties === true
						? "unknown"
						: parse(s.additionalProperties);

				fields.push({
					key: `[key: string]: ${valueType}`,
					comment: undefined,
				});
			}

			return objectStyle === "comment"
				? formatObjectFieldsWithComment(fields)
				: formatObjectFields(fields, objectStyle);
		}

		if (typeof s.type === "string") {
			return primitiveTypeMap[s.type] ?? "unknown";
		}

		return "unknown";
	}

	return addTab(parse(schema), options.tabSize ?? 1);
}
