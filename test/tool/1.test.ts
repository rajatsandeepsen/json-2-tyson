import { strict as assert } from "node:assert";
import test from "node:test";
import { getToolSchema, type ToolSchema } from "tyson-schema";

const tool: ToolSchema = {
	type: "function",
	function: {
		name: "get_weather",
		description: "Tool to get weather",
		async: true,
		parameters: {
			city: {
				description: "Tool to get weather",
				type: "string",
			},
			unit: {
				description: "Tool to get weather",
				type: "string",
				enum: ["celsius", "fahrenheit"],
			},
		},
		returns: {
			type: "number",
		},
		required: ["city"],
		additionalProperties: false,
	},
};

const expected = `// Tool to get weather
export type WeatherSchema = (params: {
  city: string,
  unit?: "celsius" | "fahrenheit"
}) => Promise<number>`;

const estimatedTime = 1;

test("generates expected tool schema", () => {
	const __start = Date.now();
	const out = getToolSchema(tool, {
		paramStyle: "multiline",
		returnStyle: "multiline",
		name: "WeatherSchema",
		export: true,
		comment: true,
		async: true,
	});
	const diff = Date.now() - __start;
	console.log(`time: ${diff}ms`);
	assert.ok(diff <= estimatedTime);

	assert.equal(out.name, "WeatherSchema");
	assert.equal(out.comment, "// Tool to get weather\n");
	assert.equal(out.code, expected);
	assert.equal(out.async, true);
});
