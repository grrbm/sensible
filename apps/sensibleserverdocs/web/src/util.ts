import * as TJS from "typescript-json-schema";

export type Method = "GET" | "POST";

export type EndpointExample = {
  type: "endpoint";
  path: `${Method}:${string}`;
  id: number;
  body: object;
  response: object;
};

export type TypeExample = {
  type: "type";
  typeInterfaceName: string;
  value: any;
};

export type DefinitionObject = {
  [key: string]: TJS.DefinitionOrBoolean;
};

export type RootModel = "root";

export type ModelSchemaObject = {
  [key: string | RootModel]: {
    endpoints?: DefinitionObject;
    types?: DefinitionObject;
    examples: (EndpointExample | TypeExample)[];
  };
};

export type Docs = {
  constants: { [key: string]: any };
  schema?: ModelSchemaObject;
  success: boolean;
  response: string;
};

export type EndpointDefinition = TJS.Definition & {
  properties: {
    method: TJS.Definition;
    path: TJS.Definition;
    body: TJS.Definition;
    reponse: TJS.Definition;
  };
};

export type DocsResult =
  | Docs
  | {
      success: false;
      error: boolean;
      response: string;
    }
  | undefined;
export const isEndpoint = (
  definition: TJS.Definition | null
): definition is EndpointDefinition => {
  return definition?.properties?.method &&
    definition?.properties?.path &&
    definition?.properties?.body &&
    definition?.properties?.response
    ? true
    : false;
};

export function notEmpty<TValue>(
  value: TValue | null | undefined
): value is TValue {
  return value !== null && value !== undefined;
}

export const getFirstEnum = (
  definition: TJS.Definition | null,
  key: string
): string | undefined =>
  getDefinition(definition?.properties?.[key])?.enum?.[0] as string | undefined;

export const getRefLink = (ref?: string) => {
  return ref?.split("/").pop();
};
export const isDocs = (docs: any): docs is Docs => {
  return docs?.schema && !!docs?.response && docs?.success ? true : false;
};

export const getDocs = (docsQuery: any): Docs | null => {
  return isDocs(docsQuery?.data) ? docsQuery.data : null;
};

export const getDefinition = (
  definitionOrBooleanOrUndefined: TJS.DefinitionOrBoolean | undefined
) => {
  const type = typeof definitionOrBooleanOrUndefined;
  return typeof definitionOrBooleanOrUndefined === "object"
    ? definitionOrBooleanOrUndefined
    : null;
};