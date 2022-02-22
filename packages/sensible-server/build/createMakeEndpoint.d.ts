import { Endpoint } from "sensible-core";
import { ServerEndpoint } from "./types";
import * as TJS from "typescript-json-schema";
import Ajv from "ajv";
import { InterpretableTypes } from "sensible-core";
export declare type Keys<TObject> = Extract<keyof TObject, string>;
export declare const ajv: Ajv;
export declare const typeHasIncorrectInterface: (typeName: string, data: any, schema: TJS.Definition) => false | string;
export declare const createMakeEndpoint: <TAllEndpoints extends unknown>(interpretableTypes: InterpretableTypes) => <TEndpoint extends Extract<keyof TAllEndpoints, string>>(path: TEndpoint, method: TAllEndpoints[TEndpoint] extends Endpoint ? TAllEndpoints[TEndpoint]["method"] : never, endpoint: ServerEndpoint<TAllEndpoints[TEndpoint] extends Endpoint ? TAllEndpoints[TEndpoint] : never>) => import("server/typings/common").Middleware;
//# sourceMappingURL=createMakeEndpoint.d.ts.map