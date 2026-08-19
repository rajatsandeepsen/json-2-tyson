import { strict as assert } from "node:assert";
import test from "node:test";
import { getTypesSchema, type JsonSchema } from "tyson-schema";

const schema: JsonSchema = {
	title: "api-response",
	type: "object",
	properties: {
		"request-id": {
			type: "string",
		},
		payload: {
			type: "object",
			properties: {
				"user-name": {
					type: "string",
				},
				roles: {
					type: "array",
					items: {
						type: "string",
					},
				},
			},
		},
	},
	required: ["request-id"],
	additionalProperties: {
		type: "string",
	},
};

test("supports escaped keys and additionalProperties index signature on nested object schema", () => {
	const out = getTypesSchema(schema, {
		export: false,
		declaration: "interface",
		objectStyle: "comment",
	});

	assert.equal(out.name, "api_response");
	assert.equal(out.declaration, "interface");

	assert.ok(out.code.includes("interface api_response {"));
	assert.ok(out.code.includes('"request-id": string;'));
	assert.ok(out.code.includes("payload?: {"));
	assert.ok(out.code.includes('"user-name"?: string;'));
	assert.ok(out.code.includes("roles?: string[];"));
	assert.ok(out.code.includes("[key: string]: string;"));
});
