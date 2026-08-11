import { z } from "zod";

export const JsonValueZod = z.union([
	z.string(),
	z.number(),
	z.boolean(),
	z.null(),
]);

export const propertyKeys = z
	.string()
	.transform((n) => (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(n) ? n : `"${n}"`));

export const BaseSchemaNodeZod = z.object({
	description: z.string().optional(),
	type: z.union([z.string(), z.array(z.string())]),
	required: z.array(z.string()).default([]),
	enum: z.array(JsonValueZod).optional(),
	const: JsonValueZod.optional(),
	properties: z.record(z.string(), z.unknown()).optional(),
	items: z.unknown().optional(),
	additionalProperties: z.unknown().optional(),
	oneOf: z.array(z.unknown()).optional(),
	anyOf: z.array(z.unknown()).optional(),
	allOf: z.array(z.unknown()).optional(),
});

export type JsonValue = z.input<typeof JsonValueZod>;

export type BaseSchemaNode = z.input<typeof BaseSchemaNodeZod>;
