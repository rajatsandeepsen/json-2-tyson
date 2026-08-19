import { strict as assert } from "node:assert";
import test from "node:test";
import { getToolSchema, type ToolSchema } from "tyson-schema";

const tool: ToolSchema = {
	type: "function",
	function: {
		name: "heartbeat",
		description: "Heartbeat",
		async: false,
		parameters: {},
		required: [],
		additionalProperties: false,
	},
};

test("handles zero params and omitted returns", () => {
	const out = getToolSchema(tool, {
		export: false,
		comment: false,
		async: true,
		paramStyle: "inline",
		returnStyle: "inline",
	});

	assert.equal(out.name, "heartbeat");
	assert.equal(out.returnType, "void");
	assert.equal(out.async, true);
	assert.equal(out.code, "type heartbeat = () => Promise<void>");
});
