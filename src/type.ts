export type JsonValue = string | number | boolean | null;

export type BaseSchemaNode = {
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
