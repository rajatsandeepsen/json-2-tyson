import { strict as assert } from "node:assert";
import test from "node:test";
import { getToolSchema, type ToolSchema } from "tyson-schema";

const tool: ToolSchema = {
	type: "function",
	function: {
		name: "send-event",
		description: "Emit event",
		async: false,
		parameters: {
			"event-name": {
				type: "string",
			},
			payload: {
				type: "object",
				properties: {
					count: {
						type: "number",
					},
				},
				required: ["count"],
			},
		},
		required: ["event-name"],
		additionalProperties: true,
	},
};

const expected = `// Emit event
type send_event = (params: { "event-name": string, payload?: { count: number }, [key: string]: unknown }) => void`;

const estimatedTime = 1;

test("generates inline sync tool schema with additional properties", () => {
	const __start = Date.now();
	const out = getToolSchema(tool, {
		paramStyle: "inline",
		returnStyle: "inline",
		export: false,
		comment: true,
		async: false,
	});
	const diff = Date.now() - __start;
	console.log(`time: ${diff}ms`);
	assert.ok(diff <= estimatedTime);

	assert.equal(out.name, "send_event");
	assert.equal(out.comment, "Emit event");
	assert.equal(out.code, expected);
	assert.equal(out.returnType, "void");
	assert.equal(out.async, false);
});
