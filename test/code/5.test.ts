import { strict as assert } from "node:assert";
import test from "node:test";
import { getDeclare } from "json-2-tyson";

test("generates exported declaration with comment", () => {
	const out = getDeclare("dist", "{\naction\n}", {
		export: true,
		comment: "schema",
	});

	assert.equal(out, `// schema\nexport declare const dist: {\n  action\n};`);
});

test("generates declaration without export", () => {
	const out = getDeclare("items", "[ alpha, beta ]", {
		export: false,
	});

	assert.equal(out, "declare const items: [ alpha, beta ];");
});
