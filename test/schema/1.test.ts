import { strict as assert } from "node:assert";
import test from "node:test";
import { getTypesSchema, type JsonSchema } from "types-schema";

const schema: JsonSchema = {
	title: "user",
	type: "object",
	description: "hello",
	properties: {
		id: {
			type: "string",
			description: "hello",
			examples: ["ABC-123"],
		},
		name: {
			description: "hello",
			type: "string",
		},
	},
	required: ["id"],
};

const expected = `// hello
export type user = {
  id: string,
  name?: string
}`;

test("generates expected type schema", () => {
	const out = getTypesSchema(schema, {
		export: true,
		comment: true,
		declaration: "type",
		objectStyle: "multiline",
	});

	assert.equal(out.code, expected);
	assert.equal(out.declaration, "type");
	assert.equal(out.name, "user");
});
