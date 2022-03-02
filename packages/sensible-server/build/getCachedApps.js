"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCachedApps = exports.getAppInfo = exports.getAppType = void 0;
const sensible_core_1 = require("sensible-core");
const getCachedCrons_1 = require("./getCachedCrons");
const getCachedSchema_1 = require("./getCachedSchema");
const path_1 = __importDefault(require("path"));
const getCachedFrontend_1 = require("./getCachedFrontend");
const getRelevantPackageInfo_1 = require("./util/getRelevantPackageInfo");
const getRepo_1 = require("./util/getRepo");
const getAppType = (projectType, folder) => {
    return ["next", "react", "react-native"].includes(projectType)
        ? "frontend"
        : ["express", "server"].includes(projectType)
            ? "server"
            : folder === "core"
                ? "core"
                : null;
};
exports.getAppType = getAppType;
/**
 *
 * @param folderPath path to app folder
 * @param modelSchemaObject only needed for core folder
 * @returns App | null
 */
const getAppInfo = (folderPath, modelSchemaObject) => {
    const folders = folderPath.split("/");
    const folder = folders.pop();
    const packageInfo = (0, getRelevantPackageInfo_1.getRelevantPackageInfo)(path_1.default.join(folderPath, "package.json"));
    if (!packageInfo) {
        console.warn("Couldn't find package.json in ", folderPath);
        return null;
    }
    const type = (0, exports.getAppType)(packageInfo.type, folder);
    const md = []; //findAllMd(folderPath);
    let crons = [];
    if (type === "server") {
        crons = (0, getCachedCrons_1.getCachedCrons)(folderPath);
    }
    let frontend = [];
    if (type === "frontend") {
        frontend = (0, getCachedFrontend_1.getCachedFrontend)(folderPath);
    }
    return {
        folder,
        name: packageInfo.name,
        private: packageInfo.private || false,
        version: packageInfo.version,
        description: packageInfo.description,
        homepage: packageInfo.homepage,
        repo: (0, getRepo_1.getRepo)(packageInfo.repository),
        md,
        crons,
        frontend,
        models: type === "core" ? modelSchemaObject : undefined,
        // TODO: put back after i cached this properly (if needed). Probably also should put this in separate api?
        dependencies: [],
        devDependencies: [],
        peerDependencies: [], //getDependencies(packageInfo.peerDependencies, folderPath),
    };
};
exports.getAppInfo = getAppInfo;
//just generate the schema once every server restart because there can't be any changes without the server restarting.
let cachedApps = [];
const getCachedApps = (appPaths, interpretableTypes, schemasFolderPath) => {
    if (cachedApps.length > 0) {
        return cachedApps;
    }
    const models = (0, getCachedSchema_1.getCachedSchema)(interpretableTypes, schemasFolderPath);
    const apps = (0, sensible_core_1.mapOrRemove)(appPaths, (path) => (0, exports.getAppInfo)(path, models));
    cachedApps = apps;
    return apps;
};
exports.getCachedApps = getCachedApps;
//# sourceMappingURL=getCachedApps.js.map