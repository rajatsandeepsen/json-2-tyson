import { strict as assert } from "node:assert";
import test from "node:test";
import { getObject } from "tyson-schema";

test("generates inline object with multiple items and no export", () => {
	const out = getObject(
		"items",
		[
			{ comment: "", name: "alpha" },
			{ comment: "", name: "beta" },
		],
		{ inline: true, export: false },
	);

	assert.equal(out, "const items = { alpha, beta };");
});
