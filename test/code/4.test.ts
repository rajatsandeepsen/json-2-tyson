import { strict as assert } from "node:assert";
import test from "node:test";
import { getArray, getObject } from "json-2-tyson";

test("generates declared object with export", () => {
	const out = getObject("dist", [{ comment: "hello", name: "action" }], {
		export: true,
		declare: "object",
	});

	assert.equal(out, `export declare const dist: {\n  action, // hello\n};`);
});

test("generates declared inline array without export", () => {
	const out = getArray("items", [{ name: "alpha" }, { name: "beta" }], {
		inline: true,
		declare: true,
	});

	assert.equal(out, "declare const items: [ alpha, beta ];");
});

test("generates declared array with top-level comment", () => {
	const out = getArray("dist", [{ name: "action" }], {
		export: true,
		declare: true,
		comment: "declared list",
	});

	assert.equal(
		out,
		`// declared list\nexport declare const dist: [\n  action\n];`,
	);
});
