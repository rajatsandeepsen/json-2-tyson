import { strict as assert } from "node:assert";
import test from "node:test";
import { getTypesSchema, type JsonSchema } from "types-schema";

const schema: JsonSchema = {
	title: "agent",
	type: "object",
	properties: {
		name: {
			type: "string",
		},
		tools: {
			type: "array",
			items: {
				type: "string",
			},
		},
	},
	required: ["name", "tools"],
};

const expected = `export type agent = {
  name: string
}`;

const estimatedTime = 1;

test("filters reserved tools property from generated schema", () => {
	const __start = Date.now();
	const out = getTypesSchema(schema, {
		export: true,
		comment: false,
		declaration: "type",
		objectStyle: "multiline",
	});
	const diff = Date.now() - __start;
	console.log(`time: ${diff}ms`);
	assert.ok(diff <= estimatedTime);

	assert.equal(out.code, expected);
	assert.equal(out.declaration, "type");
	assert.equal(out.name, "agent");
});
