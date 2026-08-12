import { strict as assert } from "node:assert";
import test from "node:test";
import { getTypesSchema, type JsonSchema } from "types-schema";

const schema: JsonSchema = {
	title: "status",
	type: "string",
	description: "state",
	enum: ["open", "closed"],
};

const expected = `// state
export type status = "open" | "closed"`;

test("falls back to type declaration when interface is not possible", () => {
	const out = getTypesSchema(schema, {
		export: true,
		comment: true,
		declaration: "interface",
		objectStyle: "multiline",
	});

	assert.equal(out.code, expected);
	assert.equal(out.declaration, "type");
	assert.equal(out.name, "status");
});
