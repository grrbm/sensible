"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMakeEndpoint = exports.typeHasIncorrectInterface = exports.ajv = void 0;
const server_1 = __importDefault(require("server"));
const getCachedSchema_1 = require("./getCachedSchema");
const getCachedEndpointSchemas_1 = require("./getCachedEndpointSchemas");
const ajv_1 = __importDefault(require("ajv"));
exports.ajv = new ajv_1.default({
    allErrors: true,
    coerceTypes: true,
    useDefaults: true,
});
const typeHasIncorrectInterface = (typeName, data, schema) => {
    //console.log("Validating", typeName, data);
    // ajv.addSchema(schema, typeName);
    //ajv.addMetaSchema(require("ajv/lib/refs/json-schema-draft-07.json"));
    const validateFunction = exports.ajv.compile(schema);
    //const validator: any = ajv.getSchema(`Schema#/definitions/${typeName}`); <--AVDD
    const isValid = validateFunction(data);
    if (!isValid) {
        //return JSON.stringify(validateFunction.errors);
        return exports.ajv.errorsText(validateFunction.errors, { dataVar: typeName });
    }
    return !isValid; //always false
};
exports.typeHasIncorrectInterface = typeHasIncorrectInterface;
const getDefinition = (definitionOrBooleanOrUndefined) => {
    const type = typeof definitionOrBooleanOrUndefined;
    return typeof definitionOrBooleanOrUndefined === "object"
        ? definitionOrBooleanOrUndefined
        : null;
};
const createMakeEndpoint = (files) => {
    return (path, method, endpoint) => {
        const callMethod = method === "GET" ? "get" : "post";
        return server_1.default.router[callMethod](`/${path}`, async (ctx) => {
            const body = method === "POST" ? ctx.data : ctx.query;
            const extendedCtx = { ...ctx, body };
            const schema = (0, getCachedSchema_1.getCachedSchema)(files);
            const { endpointSchemas, endpoints } = (0, getCachedEndpointSchemas_1.getCachedEndpointSchemas)(schema);
            const endpointInterfaceName = endpoints[path];
            const endpointSchema = endpointSchemas[path];
            const bodySchema = getDefinition(endpointSchema?.properties?.body);
            const responseSchema = getDefinition(endpointSchema?.properties?.response);
            const isUserEndpoint = !path.startsWith("sensible/");
            if (isUserEndpoint) {
                if (!bodySchema || !responseSchema) {
                    return {
                        success: false,
                        response: "Couldn't find bodySchema or repsonseSchema",
                    };
                }
                // console.dir(
                //   { endpointSchema, bodySchema, responseSchema },
                //   { depth: 999 }
                // );
                if (!endpointInterfaceName || !schema) {
                    return {
                        response: "Couldn't find schema and/or endpoint interface name",
                        success: false,
                    };
                }
                const bodyErrors = (0, exports.typeHasIncorrectInterface)(endpointInterfaceName, body, schema);
                if (bodyErrors) {
                    return {
                        response: "Body is invalid",
                        success: false,
                        errors: !bodySchema ? "Body schema undefined" : bodyErrors,
                    };
                }
            }
            const response = await endpoint(extendedCtx);
            // response validation
            if (isUserEndpoint && endpointInterfaceName && schema) {
                const responseErrors = (0, exports.typeHasIncorrectInterface)(endpointInterfaceName, response, schema);
                if (responseErrors) {
                    return {
                        response: "Response is invalid",
                        success: false,
                        errors: !responseSchema
                            ? "Response schema undefined"
                            : responseErrors,
                    };
                }
            }
            return response;
        });
    };
};
exports.createMakeEndpoint = createMakeEndpoint;
//# sourceMappingURL=createMakeEndpoint.js.map