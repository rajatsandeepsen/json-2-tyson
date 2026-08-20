import { strict as assert } from "node:assert";
import test from "node:test";
import { getToolSchema, type ToolSchema } from "json-2-tyson";

const tool: ToolSchema = {
	type: "function",
	function: {
		name: "fetch-data",
		description: "Fetch data",
		async: true,
		parameters: {
			url: {
				type: "string",
			},
		},
		returns: {
			type: "string",
		},
		required: ["url"],
		additionalProperties: false,
	},
};

const expected = `export type FetchData = (params: { url: string }) => string`;

test("supports sync signature override while preserving async metadata and suppressing comment", () => {
	const out = getToolSchema(tool, {
		name: "FetchData",
		export: true,
		comment: false,
		async: false,
		paramStyle: "inline",
		returnStyle: "inline",
	});

	assert.equal(out.code, expected);
	assert.equal(out.name, "FetchData");
	assert.equal(out.comment, "Fetch data");
	assert.equal(out.returnType, "string");
	assert.equal(out.async, false);
});
