import { strict as assert } from "node:assert";
import test from "node:test";
import { getTypesSchema, type JsonSchema } from "tyson-schema";

const schema: JsonSchema = {
	title: "1bad-name",
	type: "object",
	properties: {},
};

test("throws when title starts with a non-identifier character", () => {
	assert.throws(() =>
		getTypesSchema(schema, { declaration: "type", objectStyle: "comment" }),
	);
});
