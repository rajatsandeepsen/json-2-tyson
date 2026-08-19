import { strict as assert } from "node:assert";
import test from "node:test";
import { getTypesSchema, type JsonSchema } from "tyson-schema";

const schema: JsonSchema = {
	title: "user",
	type: "object",
	description: "hello",
	properties: {
		id: {
			type: "string",
			description: "unique id",
			examples: ["ABC-123"],
		},
		name: {
			description: "first name",
			type: "string",
		},
	},
	required: ["id"],
};

const expected = `// hello
export type user = {
  id: string, // unique id
  name?: string, // first name
};`;

const estimatedTime = 10;

test("generates expected type schema", () => {
	const __start = Date.now();
	const out = getTypesSchema(schema, {
		export: true,
		declaration: "type",
		objectStyle: "comment",
	});
	const diff = Date.now() - __start;
	console.log(`time: ${diff}ms`);
	assert.ok(diff <= estimatedTime);

	assert.equal(out.code, expected);
	assert.equal(out.declaration, "type");
	assert.equal(out.name, "user");
});
