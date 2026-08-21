import { strict as assert } from "node:assert";
import test from "node:test";
import { getToolSchema, type ToolSchema } from "json-2-tyson";

const tool: ToolSchema = {
	type: "function",
	function: {
		name: "dispatch-event",
		description: "Dispatch event",
		async: false,
		parameters: {
			type: "object",
			properties: {
				"event-name": {
					type: "string",
				},
				meta: {
					type: "object",
					properties: {
						"source-id": {
							type: "string",
						},
					},
				},
			},
			required: ["event-name"],
			additionalProperties: true,
		},
		returns: {
			type: "boolean",
		},
	},
};

test("generates inline schema with escaped param keys and additionalProperties", () => {
	const out = getToolSchema(tool, {
		export: false,
		comment: true,
		async: false,
		paramStyle: "inline",
		returnStyle: "inline",
	});

	assert.equal(out.name, "dispatch_event");
	assert.equal(out.returnType, "boolean");
	assert.equal(out.async, false);

	assert.ok(out.code.includes("type dispatch_event = (params: {"));
	assert.ok(out.code.includes('"event-name": string'));
	assert.ok(out.code.includes('meta?: { "source-id"?: string }'));
	assert.ok(out.code.includes("[key: string]: unknown"));
	assert.ok(out.code.includes("}) => boolean"));
});
