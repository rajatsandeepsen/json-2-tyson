import { strict as assert } from "node:assert";
import test from "node:test";
import { getToolCallCode } from "json-2-tyson";

test("generates tool call with comment, parent, return and async", () => {
	const out = getToolCallCode(
		{
			name: "get_weather",
			arguments: {
				city: "tokyo",
				unit: "celsius",
			},
		},
		{
			comment: "run weather",
			parent: "tools",
			return: true,
			async: true,
			multiline: true,
		},
	);

	assert.equal(
		out,
		`// run weather\nreturn await tools.get_weather({\n  "city": "tokyo",\n  "unit": "celsius"\n});`,
	);
});

test("generates tool call with string argument", () => {
	const out = getToolCallCode(
		{
			name: "sum",
			arguments: "a + b",
		},
		{},
	);

	assert.equal(out, "sum(a + b)");
});

test("generates tool call with number argument", () => {
	const out = getToolCallCode(
		{
			name: "retry",
			arguments: 3,
		},
		{},
	);

	assert.equal(out, "retry(3)");
});

test("generates tool call with array argument", () => {
	const out = getToolCallCode(
		{
			name: "emit",
			arguments: [1, "two"],
		},
		{ parent: "client", multiline: true },
	);

	assert.equal(out, `client.emit([\n  1,\n  "two"\n])`);
});

test("generates tool call with null argument as empty args", () => {
	const out = getToolCallCode(
		{
			name: "ping",
			arguments: null,
		},
		{ return: true },
	);

	assert.equal(out, "return ping();");
});

test("generates multiline tool call args when multiline is true", () => {
	const out = getToolCallCode(
		{
			name: "send",
			arguments: {
				event: "ready",
				payload: { id: 1 },
			},
		},
		{ parent: "client", multiline: true },
	);

	assert.equal(
		out,
		`client.send({
  "event": "ready",
  "payload": {
    "id": 1
  }
})`,
	);
});
