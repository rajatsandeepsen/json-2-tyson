type JsonValue = string | number | boolean | null;

type JsonSchema = {
	title?: string;
	type?: string | string[];
	properties?: Record<string, unknown>;
	required?: string[];
	items?: unknown;
	enum?: JsonValue[];
	const?: JsonValue;
	additionalProperties?: boolean | unknown;
	oneOf?: unknown[];
	anyOf?: unknown[];
	allOf?: unknown[];
};

type Options = {
	name?: string;
	export?: boolean;
	declaration?: "type" | "interface";
};

const primitiveTypeMap: Record<string, string> = {
	string: "string",
	number: "number",
	integer: "number",
	boolean: "boolean",
	null: "null",
};

function isObjectLike(value: unknown) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toTypeName(name: string) {
	const safe = name.replace(/[^a-zA-Z0-9_]+/g, " ").trim();
	const parts = safe.split(/\s+/).filter(Boolean);
	const pascal = parts
		.map((part) => part[0].toUpperCase() + part.slice(1))
		.join("");
	return pascal || "GeneratedType";
}

function escapePropertyName(name: string) {
	return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name) ? name : JSON.stringify(name);
}

function literal(value: JsonValue) {
	return JSON.stringify(value);
}

function schemaToType(schema: unknown): string {
	if (Array.isArray(schema)) {
		if (schema.length === 0) return "unknown[]";
		const elementTypes = Array.from(
			new Set(schema.map((item) => schemaToType(item))),
		);
		return `(${elementTypes.join(" | ")})[]`;
	}

	if (!isObjectLike(schema)) {
		return "unknown";
	}

	const s = schema as JsonSchema;

	if (s.const !== undefined) {
		return literal(s.const);
	}

	if (Array.isArray(s.enum) && s.enum.length > 0) {
		return s.enum.map((item) => literal(item)).join(" | ");
	}

	if (Array.isArray(s.oneOf) && s.oneOf.length > 0) {
		return s.oneOf.map((item) => schemaToType(item)).join(" | ");
	}

	if (Array.isArray(s.anyOf) && s.anyOf.length > 0) {
		return s.anyOf.map((item) => schemaToType(item)).join(" | ");
	}

	if (Array.isArray(s.allOf) && s.allOf.length > 0) {
		return s.allOf.map((item) => schemaToType(item)).join(" & ");
	}

	if (Array.isArray(s.type)) {
		const types = s.type.map((t) => primitiveTypeMap[t] ?? "unknown");
		return Array.from(new Set(types)).join(" | ");
	}

	if (s.type === "array" || s.items !== undefined) {
		if (Array.isArray(s.items)) {
			const tupleItems = s.items.map((item) => schemaToType(item)).join(", ");
			return `[${tupleItems}]`;
		}

		const itemType = s.items === undefined ? "unknown" : schemaToType(s.items);
		return `${itemType}[]`;
	}

	if (s.type === "object" || s.properties !== undefined) {
		const properties = isObjectLike(s.properties) ? s.properties : {};
		const required = new Set(Array.isArray(s.required) ? s.required : []);

		const lines = Object.entries(properties as object)
			.filter(([key]) => key !== "tools")
			.map(([key, value]) => {
				const optional = required.has(key) ? "" : "?";
				return `  ${escapePropertyName(key)}${optional}: ${schemaToType(value)}`;
			});

		if (s.additionalProperties && s.additionalProperties !== false) {
			const valueType =
				s.additionalProperties === true
					? "unknown"
					: schemaToType(s.additionalProperties);
			lines.push(`  [key: string]: ${valueType}`);
		}

		if (lines.length === 0) {
			return "Record<string, unknown>";
		}

		return `{
${lines.join("\n")}
}`;
	}

	if (typeof s.type === "string") {
		return primitiveTypeMap[s.type] ?? "unknown";
	}

	return "unknown";
}

export function getTypesSchema(schema: JsonSchema, options: Options = {}) {
	if (!isObjectLike(schema) || !schema)
		throw new Error("Invalid schema input: missing object");

	const schemaTitle =
		typeof schema.title === "string" ? schema.title : "GeneratedType";

	const typeName = toTypeName(options.name ?? schemaTitle);
	const body = schemaToType(schema);
	const declaration = options.declaration ?? "type";
	const exportPrefix = options.export ? "export " : "";
	const canUseInterface = declaration === "interface" && body.startsWith("{");

	return {
		name: typeName,
		type: body,
		declaration: canUseInterface ? ("interface" as const) : ("type" as const),
		code: canUseInterface
			? (`${exportPrefix}interface ${typeName} ${body}` as const)
			: (`${exportPrefix}type ${typeName} = ${body}` as const),
	};
}
