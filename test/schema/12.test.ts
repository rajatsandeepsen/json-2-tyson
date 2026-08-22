import { strict as assert } from "node:assert";
import test from "node:test";
import { getJsonCode } from "json-2-tyson";

test("generates json code for object with comment and return", () => {
	const out = getJsonCode(
		{
			city: "tokyo",
			unit: "celsius",
		},
		{ comment: "payload", return: true, multiline: true },
	);

	assert.equal(
		out,
		`// payload\nreturn {\n  "city": "tokyo",\n  "unit": "celsius"\n};`,
	);
});

test("generates json code for array", () => {
	const out = getJsonCode([1, "two", 3], { return: false, multiline: true });

	assert.equal(out, `[\n  1,\n  "two",\n  3\n]`);
});

test("generates json code for number", () => {
	const out = getJsonCode(42, { return: true });

	assert.equal(out, "return 42;");
});

test("generates json code for string input as raw expression", () => {
	const out = getJsonCode("a + b", { return: false });

	assert.equal(out, "a + b");
});

test("generates json code for null", () => {
	const out = getJsonCode(null, { return: true });

	assert.equal(out, "return null;");
});

test("generates json code without multiline", () => {
	const out = getJsonCode({
		meta: { v: 1 },
		ok: true,
	});

	assert.equal(out, `{"meta":{"v":1},"ok":true}`);
});
