import { strict as assert } from "node:assert";
import test from "node:test";
import { getTypesSchema, type JsonSchema } from "json-2-tyson";

const schema: JsonSchema = {
	title: "event payload",
	type: "object",
	properties: {
		id: {
			type: "string",
		},
		status: {
			type: "string",
			enum: ["ok", "fail"],
		},
	},
	required: ["id"],
};

const expected = `type event_payload = {
  id: string;
  status?: "ok" | "fail";
};`;

test("sanitizes title and generates non-exported type declaration", () => {
	const out = getTypesSchema(schema, {
		export: false,
		declaration: "type",
		objectStyle: "comment",
	});

	assert.equal(out.code, expected);
	assert.equal(out.declaration, "type");
	assert.equal(out.name, "event_payload");
});
