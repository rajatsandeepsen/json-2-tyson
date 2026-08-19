import { strict as assert } from "node:assert";
import test from "node:test";
import { getTypesSchema, type JsonSchema } from "tyson-schema";

const schema: JsonSchema = {
	title: "audit logs",
	type: "array",
	items: {
		type: "object",
		properties: {
			ts: {
				type: "string",
			},
			level: {
				type: "string",
				enum: ["info", "warn", "error"],
			},
			message: {
				type: "string",
			},
		},
		required: ["ts", "level"],
	},
};

test("falls back to type declaration for top-level array schema", () => {
	const out = getTypesSchema(schema, {
		export: true,
		declaration: "interface",
		objectStyle: "comment",
	});

	assert.equal(out.name, "audit_logs");
	assert.equal(out.declaration, "type");

	assert.ok(out.code.includes("export type audit_logs ="));
	assert.ok(out.code.includes("ts: string;"));
	assert.ok(out.code.includes('level: "info" | "warn" | "error";'));
	assert.ok(out.code.includes("message?: string;"));
	assert.ok(out.code.includes("[];") || out.code.includes("}[];"));
});
