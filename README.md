<a href="https://github.com/rajatsandeepsen/json-2-tyson">
    <img alt="cover" src="https://github.com/rajatsandeepsen/json-2-tyson/blob/main/cover.png?raw=true" />
</a>

# json-2-tyson

Turn your JSON schema into TypeScript code.

### Work in Progress

- [x] Simple & Fast
- [x] Support functions & tools
- [x] Customizable options
- [x] Support comments
- [ ] Nested tools
- [ ] Support `$defs`, `$ref`, `pattern`, `$id`, `$schema`, `minProperties`, `maxProperties`
- [ ] Support examples

## Setup

You can install the package using npm, bun, nubs or pnpm

```bash
npm i json-2-tyson
```

### Schema

```ts
import { getTypesSchema } from "json-2-tyson";

const schema = {
	title: "user",
	type: "object",
	properties: {
		type: "object",
		properties: {
			id: {
				type: "string",
			},
			name: {
				type: "string",
			},
		},
		required: ["id"],
	},
};

const out = getTypesSchema(schema, {
	export: true,
	declaration: "type",
});

console.log(out.code);
```

```ts
export type User = {
	id: string;
	name?: string;
};
```

### Tools

```ts
import { getToolSchema } from "json-2-tyson";

const tool = {
	type: "function",
	function: {
		name: "get_weather",
		description: "get weather",
		async: true,
		parameters: {
			type: "object",
			properties: {
				city: {
					type: "string",
				},
				unit: {
					type: "string",
					enum: ["celsius", "fahrenheit"],
				},
			},
			required: ["city"],
			additionalProperties: false,
		},
		returns: {
			type: "number",
		},
	},
};

const out = getToolSchema(tool, {
	export: true,
});

console.log(out.code);
```

```ts
export type get_weather = (params: {
	city: string;
	unit?: "celsius" | "fahrenheit";
}) => Promise<number>;
```

## Documentation

Please check out the [official json-schema specs](https://json-schema.org/specification) for more information.

## Inspirations

- [tool-schema](https://github.com/slegarraga/tool-schema)
- [json-schema-to-ts](https://github.com/ThomasAribart/json-schema-to-ts)
- [json-schema-to-ts](https://github.com/ThomasAribart/json-schema-to-ts)
- [json-schema-to-typescript](https://github.com/bcherny/json-schema-to-typescript)
- [typescript-json-schema](https://github.com/YousefED/typescript-json-schema)
- [zod-to-ts](https://github.com/sachinraja/zod-to-ts)
- [zod.fromJSONSchema()](https://zod.dev/json-schema)
