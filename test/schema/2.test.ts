import { strict as assert } from "node:assert";
import test from "node:test";
import { getTypesSchema, type JsonSchema } from "json-2-tyson";

const schema: JsonSchema = {
	title: "user profile",
	type: "object",
	description: "Profile model",
	properties: {
		"user-id": {
			type: "string",
		},
		age: {
			type: "integer",
		},
		role: {
			type: "string",
			enum: ["admin", "user"],
		},
	},
	required: ["user-id", "role"],
	additionalProperties: {
		type: "number",
	},
};

const expected = `// Profile model
export interface user_profile {
  "user-id": string;
  age?: number;
  role: "admin" | "user";
  [key: string]: number;
}`;

const estimatedTime = 2;

test("generates interface schema with escaped keys and index signature", () => {
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
	assert.equal(out.declaration, "interface");
	assert.equal(out.name, "user_profile");
});
