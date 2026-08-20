import { strict as assert } from "node:assert";
import test from "node:test";
import { getTypesSchema, type JsonSchema } from "json-2-tyson";

const schema: JsonSchema = {
	title: "project config",
	type: "object",
	properties: {
		name: {
			type: "string",
		},
		env: {
			type: "object",
			properties: {
				region: {
					type: "string",
				},
				retries: {
					type: "integer",
				},
			},
			required: ["region"],
		},
		features: {
			type: "array",
			items: {
				type: "object",
				properties: {
					key: {
						type: "string",
					},
					enabled: {
						type: "boolean",
					},
				},
				required: ["key"],
			},
		},
	},
	required: ["name", "env"],
};

test("generates deep nested object and array type schema", () => {
	const out = getTypesSchema(schema, {
		export: true,
		declaration: "type",
		objectStyle: "comment",
	});

	assert.equal(out.name, "project_config");
	assert.equal(out.declaration, "type");

	const snippets = [
		"export type project_config = {",
		"name: string;",
		"env: {",
		"region: string;",
		"retries?: number;",
		"features?: {",
		"key: string;",
		"enabled?: boolean;",
		"}[];",
	];

	for (const snippet of snippets) {
		assert.ok(
			out.code.includes(snippet),
			`expected output code to include snippet: ${snippet}`,
		);
	}
});
