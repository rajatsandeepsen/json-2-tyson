import { strict as assert } from "node:assert";
import test from "node:test";
import { getToolSchema, type ToolSchema } from "json-2-tyson";

const tool: ToolSchema = {
	type: "function",
	function: {
		name: "ping",
		description: "   ",
		async: true,
		returns: {
			type: "string",
		},
	},
};

const expected = `export type ping = () => Promise<string>`;

const estimatedTime = 1;

test("omits empty comment and keeps async from tool definition", () => {
	const __start = Date.now();
	const out = getToolSchema(tool, {
		export: true,
		comment: true,
	});
	const diff = Date.now() - __start;
	console.log(`time: ${diff}ms`);
	assert.ok(diff <= estimatedTime);

	assert.equal(out.name, "ping");
	assert.equal(out.comment, "");
	assert.equal(out.code, expected);
	assert.equal(out.returnType, "string");
	assert.equal(out.async, true);
});
