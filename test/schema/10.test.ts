import { strict as assert } from "node:assert";
import test from "node:test";
import { getTypesSchema, type JsonSchema } from "json-2-tyson";

const schema: JsonSchema = {
	title: "tuple packet",
	type: "object",
	properties: {
		header: {
			type: "object",
			properties: {
				kind: {
					const: "packet",
					type: "string",
				},
				mode: {
					type: ["string", "null", "string"],
				},
			},
			required: ["kind", "mode"],
		},
		coords: {
			type: "array",
			items: [{ type: "number" }, { type: "number" }, { type: "number" }],
		},
	},
	required: ["header", "coords"],
};

test("handles tuple arrays, const, and string-array type unions", () => {
	const out = getTypesSchema(schema, {
		export: false,
		declaration: "type",
		objectStyle: "comment",
	});

	assert.equal(out.name, "tuple_packet");
	assert.equal(out.declaration, "type");

	assert.ok(out.code.includes("type tuple_packet = {"));
	assert.ok(out.code.includes('kind: "packet";'));
	assert.ok(out.code.includes("mode: string | null;"));
	assert.ok(out.code.includes("coords: [number, number, number];"));
});
