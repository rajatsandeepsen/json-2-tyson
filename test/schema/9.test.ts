import { strict as assert } from "node:assert";
import test from "node:test";
import { getTypesSchema, type JsonSchema } from "json-2-tyson";

const schema: JsonSchema = {
	title: "combinator model",
	type: "object",
	properties: {
		status: {
			oneOf: [{ type: "string" }, { type: "number" }],
			type: "string",
		},
		payload: {
			anyOf: [
				{ type: "null" },
				{
					type: "object",
					properties: {
						ok: { type: "boolean" },
					},
					required: ["ok"],
				},
			],
			type: "object",
		},
		meta: {
			allOf: [
				{
					type: "object",
					properties: {
						id: { type: "string" },
					},
					required: ["id"],
				},
				{
					type: "object",
					properties: {
						ver: { type: "integer" },
					},
					required: ["ver"],
				},
			],
			type: "object",
		},
	},
	required: ["status", "meta"],
};

test("getTypesSchema handles oneOf, anyOf, and allOf inside object properties", () => {
	const out = getTypesSchema(schema, {
		export: true,
		declaration: "type",
		objectStyle: "comment",
	});

	assert.equal(out.name, "combinator_model");
	assert.equal(out.declaration, "type");
	assert.ok(out.code.includes("status: string | number;"));
	assert.ok(out.code.includes("payload?: null | {"));
	assert.ok(out.code.includes("ok: boolean;"));
	assert.ok(out.code.includes("meta: {"));
	assert.ok(out.code.includes("id: string;"));
	assert.ok(out.code.includes("} & {"));
	assert.ok(out.code.includes("ver: number;"));
});
