import { strict as assert } from "node:assert";
import test from "node:test";
import { getToolSchema, type ToolSchema } from "json-2-tyson";

const tool: ToolSchema = {
	type: "function",
	function: {
		name: "set-user",
		description: "Set user",
		async: false,
		parameters: {
			type: "object",
			properties: {
				id: {
					type: "string",
					description: "user id",
				},
				active: {
					type: "boolean",
					description: "is active",
				},
			},
			required: ["id"],
			additionalProperties: false,
		},
	},
};

test("generates comment-style params with field comments", () => {
	const out = getToolSchema(tool, {
		export: true,
		comment: true,
		paramStyle: "comment",
		returnStyle: "inline",
		async: false,
	});

	assert.equal(out.name, "set_user");
	assert.equal(out.returnType, "void");

	assert.ok(out.code.includes("export type set_user = (params: {"));
	assert.ok(out.code.includes("id: string; // user id"));
	assert.ok(out.code.includes("active?: boolean; // is active"));
	assert.ok(out.code.includes("}) => void"));
});
