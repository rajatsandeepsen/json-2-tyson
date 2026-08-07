type JsonValue = string | number | boolean | null;

type SchemaNode = {
	type?: string | string[];
	enum?: JsonValue[];
	const?: JsonValue;
	properties?: Record<string, unknown>;
	required?: string[];
	items?: unknown;
	additionalProperties?: boolean | unknown;
	oneOf?: unknown[];
	anyOf?: unknown[];
	allOf?: unknown[];
};

type ToolFunction = {
	name?: string;
	async?: boolean;
	parameters?: unknown;
	returns?: unknown;
	required?: string[];
	additionalProperties?: boolean | unknown;
};

type ToolInput = {
	type?: string;
	function?: ToolFunction;
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

function escapePropertyName(name: string) {
	return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name) ? name : JSON.stringify(name);
}

function toTypeAliasName(name: string) {
	const normalized = name.replace(/[^A-Za-z0-9_$]/g, "_");
	if (/^[A-Za-z_$]/.test(normalized)) return normalized;
	return `_${normalized || "tool"}`;
}

function literal(value: JsonValue) {
	return JSON.stringify(value);
}

function schemaToTs(schema: unknown): string {
	if (Array.isArray(schema)) {
		if (schema.length === 0) return "unknown[]";
		const elementTypes = Array.from(
			new Set(schema.map((item) => schemaToTs(item))),
		);
		return `(${elementTypes.join(" | ")})[]`;
	}

	if (!isObjectLike(schema)) {
		return "unknown";
	}

	const s = schema as SchemaNode;

	if (s.const !== undefined) {
		return literal(s.const);
	}

	if (Array.isArray(s.enum) && s.enum.length > 0) {
		return s.enum.map((item) => literal(item)).join(" | ");
	}

	if (Array.isArray(s.oneOf) && s.oneOf.length > 0) {
		return s.oneOf.map((item) => schemaToTs(item)).join(" | ");
	}

	if (Array.isArray(s.anyOf) && s.anyOf.length > 0) {
		return s.anyOf.map((item) => schemaToTs(item)).join(" | ");
	}

	if (Array.isArray(s.allOf) && s.allOf.length > 0) {
		return s.allOf.map((item) => schemaToTs(item)).join(" & ");
	}

	if (Array.isArray(s.type)) {
		const types = s.type.map((t) => primitiveTypeMap[t] ?? "unknown");
		return Array.from(new Set(types)).join(" | ");
	}

	if (s.type === "array" || s.items !== undefined) {
		if (Array.isArray(s.items)) {
			const tupleItems = s.items.map((item) => schemaToTs(item)).join(", ");
			return `[${tupleItems}]`;
		}

		const itemType = s.items === undefined ? "unknown" : schemaToTs(s.items);
		return `${itemType}[]`;
	}

	if (s.type === "object" || s.properties !== undefined) {
		const properties = isObjectLike(s.properties) ? s.properties : {};
		const required = new Set(Array.isArray(s.required) ? s.required : []);

		const fields: string[] = Object.entries(properties as object).map(
			([key, value]) => {
				const optional = required.has(key) ? "" : "?";
				return `${escapePropertyName(key)}${optional}: ${schemaToTs(value)}`;
			},
		);

		if (s.additionalProperties && s.additionalProperties !== false) {
			const valueType =
				s.additionalProperties === true
					? "unknown"
					: schemaToTs(s.additionalProperties);
			fields.push(`[key: string]: ${valueType}`);
		}

		return `{ ${fields.join(", ")} }`;
	}

	if (typeof s.type === "string") {
		return primitiveTypeMap[s.type] ?? "unknown";
	}

	return "unknown";
}

function extractParametersShape(toolFunction: ToolFunction) {
	const raw = toolFunction.parameters;

	if (!isObjectLike(raw)) {
		return {
			properties: {} as Record<string, unknown>,
			required: new Set<string>(),
			additionalProperties: false as boolean | unknown,
		};
	}

	const asSchema = raw as SchemaNode;

	if (asSchema.type === "object" || asSchema.properties !== undefined) {
		return {
			properties: isObjectLike(asSchema.properties)
				? asSchema.properties
				: ({} as Record<string, unknown>),
			required: new Set(
				Array.isArray(asSchema.required) ? asSchema.required : [],
			),
			additionalProperties:
				asSchema.additionalProperties ??
				toolFunction.additionalProperties ??
				false,
		};
	}

	return {
		properties: raw as Record<string, unknown>,
		required: new Set(
			Array.isArray(toolFunction.required) ? toolFunction.required : [],
		),
		additionalProperties: toolFunction.additionalProperties ?? false,
	};
}

export function TypeSchemaTool(
	input: ToolInput,
	options: {
		name?: string;
		export?: boolean;
		async?: boolean;
	} = {},
) {
	if (!isObjectLike(input)) {
		throw new Error("Invalid tool input: expected an object");
	}

	const toolFunction = input.function;

	if (!isObjectLike(toolFunction) || !toolFunction) {
		throw new Error("Invalid tool input: missing function object");
	}

	const schemaName =
		typeof toolFunction.name === "string" ? toolFunction.name : "tool";
	const name = toTypeAliasName(options.name ?? schemaName);

	const { properties, required, additionalProperties } =
		extractParametersShape(toolFunction);

	const fields: string[] = Object.entries(properties as object).map(
		([key, value]) => {
			const optional = required.has(key) ? "" : "?";
			return `${escapePropertyName(key)}${optional}: ${schemaToTs(value)}`;
		},
	);

	if (additionalProperties && additionalProperties !== false) {
		const valueType =
			additionalProperties === true
				? "unknown"
				: schemaToTs(additionalProperties);
		fields.push(`[key: string]: ${valueType}`);
	}

	const parameterType = `{ ${fields.join(", ")} }`;

	const async = options.async ?? toolFunction.async ?? false;
	const baseReturnType = toolFunction.returns
		? schemaToTs(toolFunction.returns)
		: "void";
	const returnType = async ? `Promise<${baseReturnType}>` : baseReturnType;

	const exportPrefix = options.export ? "export type" : "type";

	return {
		code: `${exportPrefix} ${name} = (params: ${parameterType}) => ${returnType}`,
		name,
		async,
		parameterType,
		returnType: baseReturnType,
	};
}
