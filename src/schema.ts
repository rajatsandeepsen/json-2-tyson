import { z } from "zod";
import { schemaToType } from "./core";
import { BaseSchemaNodeZod } from "./type";
import { getComment, toTypeName } from "./utils";

const JsonSchemaZod = BaseSchemaNodeZod.extend({
	title: z.string().default("Data"),
});

export type JsonSchema = z.input<typeof JsonSchemaZod>;

type Options = {
	name?: string;
	export?: boolean;
	declaration?: "type" | "interface";
	objectStyle?: "inline" | "multiline" | "comment";
};

export function getTypesSchema(data: JsonSchema, options: Options = {}) {
	const { title, description, ...schema } = JsonSchemaZod.parse(data);

	const typeName = toTypeName(options.name ?? title);

	const body = schemaToType(schema, {
		objectStyle: options.objectStyle,
		filterProperty: (k) => k !== "tools",
	});
	const declaration = options.declaration ?? "type";
	const exportPrefix = options.export ? "export " : "";
	const canUseInterface =
		declaration === "interface" && body.startsWith("{") && body.endsWith("}");

	const comment =
		options.objectStyle === "comment" ? getComment(description, "\n") : "";

	return {
		name: typeName,
		comment: description,
		type: body,
		declaration: canUseInterface ? ("interface" as const) : ("type" as const),
		code: canUseInterface
			? `${comment}${exportPrefix}interface ${typeName} ${body}`
			: `${comment}${exportPrefix}type ${typeName} = ${body};`,
	};
}
