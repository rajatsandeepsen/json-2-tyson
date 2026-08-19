import { strict as assert } from "node:assert";
import test from "node:test";
import { getToolSchema, type ToolSchema } from "tyson-schema";

const tool: ToolSchema = {
	type: "function",
	function: {
		name: "create-report",
		description: "Create report",
		async: true,
		parameters: {
			projectId: {
				type: "string",
			},
			filters: {
				type: "object",
				properties: {
					from: {
						type: "string",
					},
					to: {
						type: "string",
					},
					tags: {
						type: "array",
						items: {
							type: "string",
						},
					},
				},
			},
		},
		returns: {
			type: "object",
			properties: {
				id: {
					type: "string",
				},
				status: {
					type: "string",
					enum: ["queued", "done"],
				},
			},
			required: ["id"],
		},
		required: ["projectId"],
		additionalProperties: false,
	},
};

test("generates nested multiline schema for create-report", () => {
	const out = getToolSchema(tool, {
		name: "CreateReport",
		export: true,
		comment: true,
		async: true,
		paramStyle: "multiline",
		returnStyle: "multiline",
	});

	assert.equal(out.name, "CreateReport");
	assert.equal(out.comment, "Create report");
	assert.equal(out.async, true);

	assert.ok(out.code.includes("export type CreateReport = (params: {"));
	assert.ok(out.code.includes("projectId: string;"));
	assert.ok(out.code.includes("filters?: {"));
	assert.ok(out.code.includes("tags?: string[];"));
	assert.ok(out.code.includes("}) => Promise<{"));
	assert.ok(out.code.includes("id: string;"));
	assert.ok(out.code.includes('status?: "queued" | "done";'));
});
