import { strict as assert } from "node:assert";
import test from "node:test";
import { getArray } from "json-2-tyson";

test("generates inline array from list", () => {
	const out = getArray(
		"items",
		[
			{ comment: "", name: "alpha" },
			{ comment: "", name: "beta" },
		],
		{ inline: true, export: false },
	);

	assert.equal(out, "const items = [ alpha, beta ];");
});

test("generates array from list with item comment", () => {
	const out = getArray("dist", [{ comment: "hello", name: "action" }], {
		export: true,
	});

	assert.equal(out, `export const dist = [\n  action, // hello\n];`);
});

test("generates array with top-level comment", () => {
	const out = getArray("dist", [{ comment: "", name: "action" }], {
		export: true,
		comment: "this is list",
	});

	assert.equal(out, `// this is list\nexport const dist = [\n  action\n];`);
});

test("returns raw array when raw option is true", () => {
	const out = getArray(
		"ignored",
		[
			{ comment: "first", name: "alpha" },
			{ comment: "", name: "beta" },
		],
		{ raw: true, export: true, comment: "top comment" },
	);

	assert.equal(
		out,
		`[
alpha, // first
beta
]`,
	);
});

test("returns inline raw array when raw and inline are true", () => {
	const out = getArray(
		"ignored",
		[
			{ comment: "first", name: "alpha" },
			{ comment: "", name: "beta" },
		],
		{ raw: true, inline: true, export: true, comment: "top comment" },
	);

	assert.equal(out, "[ alpha, beta ]");
});
