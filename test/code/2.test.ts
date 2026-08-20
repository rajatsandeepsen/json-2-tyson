import { strict as assert } from "node:assert";
import test from "node:test";
import { getObject } from "json-2-tyson";

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

test("returns raw object when raw option is true", () => {
	const out = getObject(
		"ignored",
		[
			{ comment: "first", name: "alpha" },
			{ comment: "", name: "beta" },
		],
		{ raw: true, export: true, comment: "top comment" },
	);

	assert.equal(
		out,
		`{
alpha, // first
beta
}`,
	);
});

test("returns inline raw object when raw and inline are true", () => {
	const out = getObject(
		"ignored",
		[
			{ comment: "first", name: "alpha" },
			{ comment: "", name: "beta" },
		],
		{ raw: true, inline: true, export: true, comment: "top comment" },
	);

	assert.equal(out, "{ alpha, beta }");
});
