import { strict as assert } from "node:assert";
import test from "node:test";
import { getToolSchema, type ToolSchema } from "json-2-tyson";

const tool: ToolSchema = {
	type: "function",
	function: {
		name: "sum",
		description: "  Compute summary  ",
		async: false,
		parameters: {
			type: "object",
			properties: {
				values: {
					type: "array",
					items: {
						type: "number",
					},
				},
			},
			required: ["values"],
			additionalProperties: false,
		},
		returns: {
			type: "object",
			properties: {
				total: {
					type: "number",
				},
				currency: {
					type: "string",
					enum: ["USD", "EUR"],
				},
			},
			required: ["total"],
		},
	},
};

const expected = `// Compute summary
export type ResultTool = (params: {
  values: number[];
}) => Promise<{
  total: number;
  currency?: "USD" | "EUR";
}>`;

const estimatedTime = 1;

test("generates multiline async tool schema with multiline return object", () => {
	const __start = Date.now();
	const out = getToolSchema(tool, {
		paramStyle: "multiline",
		returnStyle: "multiline",
		name: "ResultTool",
		export: true,
		comment: true,
		async: true,
	});
	const diff = Date.now() - __start;
	console.log(`time: ${diff}ms`);
	assert.ok(diff <= estimatedTime);

	assert.equal(out.name, "ResultTool");
	assert.equal(out.comment, "Compute summary");
	assert.equal(out.code, expected);
	assert.equal(
		out.returnType,
		`{
  total: number;
  currency?: "USD" | "EUR";
}`,
	);
	assert.equal(out.async, true);
});
