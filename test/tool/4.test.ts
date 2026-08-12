import { strict as assert } from "node:assert";
import test from "node:test";
import { getToolSchema, type ToolSchema } from "types-schema";

const tool: ToolSchema = {
	type: "function",
	function: {
		name: "ping",
		description: "   ",
		async: true,
		parameters: {},
		returns: {
			type: "string",
		},
		required: [],
		additionalProperties: false,
	},
};

const expected = `export type ping = (params: {  }) => Promise<string>`;

test("omits empty comment and keeps async from tool definition", () => {
	const out = getToolSchema(tool, {
		export: true,
		comment: true,
	});

	assert.equal(out.name, "ping");
	assert.equal(out.comment, "");
	assert.equal(out.code, expected);
	assert.equal(out.returnType, "string");
	assert.equal(out.async, true);
});
