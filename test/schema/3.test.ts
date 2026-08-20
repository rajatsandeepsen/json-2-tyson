import { strict as assert } from "node:assert";
import test from "node:test";
import { getTypesSchema, type JsonSchema } from "json-2-tyson";

const schema: JsonSchema = {
	title: "status",
	type: "string",
	description: "state",
	enum: ["open", "closed"],
};

const expected = `// state
export type status = "open" | "closed";`;

const estimatedTime = 1;

test("falls back to type declaration when interface is not possible", () => {
	const __start = Date.now();
	const out = getTypesSchema(schema, {
		export: true,
		declaration: "interface",
		objectStyle: "comment",
	});
	const diff = Date.now() - __start;
	console.log(`time: ${diff}ms`);
	assert.ok(diff <= estimatedTime);

	assert.equal(out.code, expected);
	assert.equal(out.declaration, "type");
	assert.equal(out.name, "status");
});
