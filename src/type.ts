import { z } from "zod";

export const JsonValueZod = z.union([
	z.string(),
	z.number(),
	z.boolean(),
	z.null(),
]);

export const BaseSchemaNodeZod = z.object({
	description: z.string().optional(),
	type: z.union([z.string(), z.array(z.string())]),
	required: z.array(z.string()).optional(),
	enum: z.array(JsonValueZod).optional(),
	const: JsonValueZod.optional(),
	properties: z.record(z.string(), z.unknown()).optional(),
	items: z.unknown().optional(),
	additionalProperties: z.unknown().optional(),
	oneOf: z.array(z.unknown()).optional(),
	anyOf: z.array(z.unknown()).optional(),
	allOf: z.array(z.unknown()).optional(),
});

export type JsonValue = z.infer<typeof JsonValueZod>;

export type BaseSchemaNode = z.infer<typeof BaseSchemaNodeZod>;
