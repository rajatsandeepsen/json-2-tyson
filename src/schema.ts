import { schemaToType } from "./core";
import type { BaseSchemaNode } from "./type";
import { isObjectLike, toTypeName } from "./utils";

export type JsonSchema = BaseSchemaNode & {
	title?: string;
};

type Options = {
	objectStyle?: "inline" | "multiline";
	name?: string;
	export?: boolean;
	declaration?: "type" | "interface";
};

export function getTypesSchema(schema: JsonSchema, options: Options = {}) {
	if (!isObjectLike(schema) || !schema)
		throw new Error("Invalid schema input: missing object");

	const schemaTitle =
		typeof schema.title === "string" ? schema.title : "GeneratedType";

	const typeName = toTypeName(options.name ?? schemaTitle);
	const body = schemaToType(schema, {
		objectStyle: options.objectStyle,
		filterProperty: (k) => k !== "tools",
	});
	const declaration = options.declaration ?? "type";
	const exportPrefix = options.export ? "export " : "";
	const canUseInterface = declaration === "interface" && body.startsWith("{");

	return {
		name: typeName,
		type: body,
		declaration: canUseInterface ? ("interface" as const) : ("type" as const),
		code: canUseInterface
			? (`${exportPrefix}interface ${typeName} ${body}` as const)
			: (`${exportPrefix}type ${typeName} = ${body}` as const),
	};
}
