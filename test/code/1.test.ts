import { strict as assert } from "node:assert";
import test from "node:test";
import { getObject } from "tyson-schema";

test("generates inline object from list", () => {
	const out = getObject("dist", [{ comment: "", name: "hello" }], {
		export: true,
		inline: true,
	});

	assert.equal(out, "export const dist = { hello };");
});

test("generates object from list", () => {
	const out = getObject("dist", [{ comment: "// hello", name: "action" }], {
		export: true,
	});

	console.log(out);

	assert.equal(out, `export const dist = {\n  action, // hello\n};`);
});
