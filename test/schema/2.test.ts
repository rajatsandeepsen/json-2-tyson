import { strict as assert } from "node:assert";
import test from "node:test";
import { getTypesSchema, type JsonSchema } from "types-schema";

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
  "user-id": string,
  age?: number,
  role: "admin" | "user",
  [key: string]: number
}`;

test("generates interface schema with escaped keys and index signature", () => {
	const out = getTypesSchema(schema, {
		export: true,
		comment: true,
		declaration: "interface",
		objectStyle: "multiline",
	});

	assert.equal(out.code, expected);
	assert.equal(out.declaration, "interface");
	assert.equal(out.name, "user_profile");
});
