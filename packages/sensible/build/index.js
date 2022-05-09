#!/usr/bin/env node
"use strict";
//this should run the whole script as a cli
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", { value: true });
var readline_1 = __importDefault(require("readline"));
var path_1 = __importDefault(require("path"));
var child_process_1 = require("child_process");
var fs_1 = __importDefault(require("fs"));
var os_1 = require("os");
var util_templates_1 = require("./util.templates");
var util_log_1 = require("./util.log");
var util_platform_1 = require("./util.platform");
//import latestVersion from "latest-version";
var command_exists_1 = __importDefault(require("command-exists"));
//InstallHelper
var installHelper = (_a = {},
    _a[util_platform_1.platformIds.macOS] = "brew",
    _a[util_platform_1.platformIds.windows] = "choco",
    _a[util_platform_1.platformIds.linux] = "brew",
    _a);
var openUrlHelper = (_b = {},
    _b[util_platform_1.platformIds.macOS] = "open",
    _b[util_platform_1.platformIds.windows] = "start",
    _b[util_platform_1.platformIds.linux] = "open",
    _b);
var copyCommandHelper = (_c = {},
    _c[util_platform_1.platformIds.macOS] = function (source, dest) {
        return "cp -R ".concat(source, " ").concat(dest);
    },
    _c[util_platform_1.platformIds.windows] = function (source, dest) {
        return "robocopy \"".concat(source, "\" \"").concat(dest, "\" /MIR");
    },
    _c[util_platform_1.platformIds.linux] = function (source, dest) {
        return "cp -R ".concat(source, " ").concat(dest);
    },
    _c);
var removeDirCommandHelper = (_d = {},
    _d[util_platform_1.platformIds.macOS] = function (filePath) {
        return "rm -rf ".concat(filePath);
    },
    _d[util_platform_1.platformIds.windows] = function (filePath) {
        return "rmdir ".concat(filePath, " /s /q");
    },
    _d[util_platform_1.platformIds.linux] = function (filePath) {
        return "rm -rf ".concat(filePath);
    },
    _d);
var makeDirCommandHelper = (_e = {},
    _e[util_platform_1.platformIds.macOS] = function (filePath) {
        return "mkdir -p ".concat(filePath);
    },
    _e[util_platform_1.platformIds.windows] = function (filePath) {
        return "mkdir \"".concat(filePath, "\"");
    },
    _e[util_platform_1.platformIds.linux] = function (filePath) {
        return "mkdir -p ".concat(filePath);
    },
    _e);
var removeDirAndRecreateEmptyHelper = (_f = {},
    _f[util_platform_1.platformIds.macOS] = function (filePath) {
        return "rm -rf ".concat(filePath, " && mkdir -p ").concat(filePath);
    },
    _f[util_platform_1.platformIds.windows] = function (filePath) {
        return "if exist \"".concat(filePath, "\" (rmdir \"").concat(filePath, "\" /s /q && mkdir \"").concat(filePath, "\") else (mkdir \"").concat(filePath, "\")");
    },
    _f[util_platform_1.platformIds.linux] = function (filePath) {
        return "rm -rf ".concat(filePath, " && mkdir -p ").concat(filePath);
    },
    _f);
var os = process.platform;
var currentPlatformId = (0, util_platform_1.getPlatformId)(os);
//CONSTANTS
var DEBUG_COMMANDS = false;
var defaultAppName = "makes-sense";
//test environment should be optional and easy to set up, live should be the default, since we want people to immedeately ship
var initialCommitMessage = "🧠 This Makes Sense";
// currently, this results in a couple of invalid hook calls due to mismatching react* versions
var includedRepoSlugs = [
// "Code-From-Anywhere/react-with-native",
// "Code-From-Anywhere/sensible",
];
var settingsLocation = path_1.default.join((0, os_1.homedir)(), ".sensible/settings.txt");
var settingsString = fs_1.default.existsSync(settingsLocation)
    ? fs_1.default.readFileSync(settingsLocation, "utf8")
    : "";
var settingsArray = settingsString.split(" ");
var findArgument = function (flag) { return function (arg) {
    return arg.startsWith("--".concat(flag));
}; };
var getFlagValue = function (flag) {
    return flag ? flag.split("=")[1] || true : false;
};
var getFlag = function (flag) {
    var foundFlagSettings = settingsArray.find(findArgument(flag));
    var foundFlag = process.argv.find(findArgument(flag));
    var flagValue = getFlagValue(foundFlagSettings) || getFlagValue(foundFlag);
    return flagValue;
};
var isDebug = getFlag("debug");
var isNonInteractive = getFlag("non-interactive");
var isOffline = getFlag("offline");
var isNoCache = getFlag("no-cache") || true; //doesn't work for some reason
var isNoThirdParty = getFlag("no-third-party");
var mainBranch = getFlag("branch");
var cacheDays = getFlag("cache-days");
var isNewDefaults = getFlag("new-defaults");
var cacheDaysNumber = typeof cacheDays === "string" && !isNaN(Number(cacheDays))
    ? Number(cacheDays)
    : 1;
var cacheUpdatedAtLocation = path_1.default.join((0, os_1.homedir)(), ".sensible/updatedAt.txt");
var updatedAt = fs_1.default.existsSync(cacheUpdatedAtLocation)
    ? fs_1.default.readFileSync(cacheUpdatedAtLocation, "utf8")
    : "0";
var firstTimeCli = updatedAt === "0";
var difference = Date.now() - Number(updatedAt);
var shouldGetCache = (difference < 86400 * 1000 * cacheDaysNumber || isOffline) && !isNoCache;
var mainBranchName = typeof mainBranch === "string" && mainBranch.length > 0 ? mainBranch : "live";
var sensibleDir = path_1.default.resolve(__dirname, "..");
var targetDir = process.cwd();
//UTILITY FUNCTIONS
function slugify(string) {
    var a = "àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìıİłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;";
    var b = "aaaaaaaaaacccddeeeeeeeegghiiiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------";
    var p = new RegExp(a.split("").join("|"), "g");
    return string
        .toString()
        .toLowerCase()
        .replace(/\s+/g, "-") // Replace spaces with -
        .replace(p, function (c) {
        return b.charAt(a.indexOf(c));
    }) // Replace special characters
        .replace(/&/g, "-and-") // Replace & with 'and'
        .replace(/[^\w\-]+/g, "") // Remove all non-word characters
        .replace(/\-\-+/g, "-") // Replace multiple - with single -
        .replace(/^-+/, "") // Trim - from start of text
        .replace(/-+$/, ""); // Trim - from end of text
}
var ask = function (question) {
    var rl = readline_1.default.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false,
    });
    return new Promise(function (resolve) {
        rl.question(question, function (input) {
            resolve(input);
            rl.close();
        });
    });
};
var flagArgumentsString = process.argv
    .filter(function (a) { return a.startsWith("--"); })
    .join(",");
//.join(" ");
var argumentsWithoutFlags = process.argv.filter(function (a) { return !a.startsWith("--"); });
var getArgumentOrAsk = function (argumentPosition, question) { return __awaiter(void 0, void 0, void 0, function () {
    var argument;
    return __generator(this, function (_a) {
        argument = argumentsWithoutFlags[argumentPosition + 1];
        if (argument && argument.length > 0)
            return [2 /*return*/, argument];
        if (isNonInteractive) {
            return [2 /*return*/, ""];
        }
        return [2 /*return*/, ask(question)];
    });
}); };
var askOk = function (question) { return __awaiter(void 0, void 0, void 0, function () {
    var answer;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, ask(question)];
            case 1:
                answer = _a.sent();
                return [2 /*return*/, ["yes", "y", ""].includes(answer)];
        }
    });
}); };
var getApps = function () { return __awaiter(void 0, void 0, void 0, function () {
    var possibleApps, appsString, apps;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                possibleApps = [
                    {
                        slug: "app",
                        description: "Expo app (for android, iOS, web)",
                        default: true,
                    },
                    { slug: "web", description: "Next.js app", default: true },
                    { slug: "webreact", description: "Bare React.js app (Experimental)" },
                    { slug: "chrome", description: "Chrome extension (Experimental)" },
                    { slug: "vscode", description: "VSCode extension (Experimental)" },
                    {
                        slug: "computer",
                        description: "Electron app (for Windows, Linux and MacOS) (Experimental)",
                    },
                ];
                return [4 /*yield*/, ask("Which apps do you want to create boilerplates for? Just press enter for all non-experimental ones \n    \n".concat(possibleApps
                        .map(function (possible) { return "- ".concat(possible.slug, ": ").concat(possible.description, "\n"); })
                        .join(""), "\n"))];
            case 1:
                appsString = _a.sent();
                apps = appsString === ""
                    ? possibleApps.filter(function (x) { return x.default; }).map(function (x) { return x.slug; })
                    : appsString
                        .replaceAll(" ", ",")
                        .replaceAll(";", ",")
                        .split(",")
                        .filter(function (canditateApp) {
                        return possibleApps.map(function (app) { return app.slug; }).includes(canditateApp) ===
                            true;
                    });
                return [2 /*return*/, apps];
        }
    });
}); };
var getName = function () { return __awaiter(void 0, void 0, void 0, function () {
    var name, appName, n, fullAppName;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, getArgumentOrAsk(2, "What should your sensible app be called? (default: ".concat(defaultAppName, ")\n"))];
            case 1:
                name = _a.sent();
                appName = name.length > 0 ? slugify(name) : defaultAppName;
                n = 0;
                fullAppName = appName;
                while (fs_1.default.existsSync(fullAppName)) {
                    n++;
                    fullAppName = "".concat(appName).concat(n);
                }
                if (fullAppName !== appName) {
                    (0, util_log_1.log)("Using name ".concat(fullAppName, " because ").concat(appName, " folder already exists."));
                }
                return [2 /*return*/, fullAppName];
        }
    });
}); };
var getRemote = function (name) { return __awaiter(void 0, void 0, void 0, function () {
    var remote;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, getArgumentOrAsk(3, "Where should ".concat(name, " be hosted? Provide an URL or a GitHub slug (either \"org/repo\" or \"username/repo\")\n"))];
            case 1:
                remote = _a.sent();
                return [2 /*return*/, remote.length > 0
                        ? remote.includes("https://")
                            ? remote
                            : "https://github.com/".concat(remote, ".git")
                        : null];
        }
    });
}); };
var askOpenDocs = function () { return __awaiter(void 0, void 0, void 0, function () {
    var openDocs;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, askOk("That's all we need to know! Do you want to open the docs while waiting?\n")];
            case 1:
                openDocs = _a.sent();
                if (openDocs) {
                    executeCommand({
                        description: "Opening docs",
                        command: "".concat(openUrlHelper[currentPlatformId], " https://doc.sensible.to"),
                    }, __dirname, false);
                }
                return [2 /*return*/];
        }
    });
}); };
var isCommandPerOs = function (command) {
    if (typeof command === "object") {
        return true;
    }
    return false;
};
var getCommand = function (command) {
    if (!command.command) {
        console.log("[sensible]: ", "command returned false");
        return false;
    }
    if (isCommandPerOs(command.command)) {
        var cmd = command.command[os] || command.command.default;
        console.log("[sensible]: ", "command returned ".concat(cmd));
        return cmd;
    }
    console.log("[sensible]: ", "command returned ".concat(command.command));
    return command.command;
};
var executeCommand = function (command, dir, debug) {
    // if command is disabled, immediately resolve so it is skippped.
    if (command.isDisabled) {
        return new Promise(function (resolve) {
            resolve();
        });
    }
    //tell the user what is happening, with a dot every second
    process.stdout.write(command.description);
    var interval = setInterval(function () { return process.stdout.write("."); }, 5000);
    return new Promise(function (resolve) {
        var messages = [];
        var onFinish = function (_a) {
            var success = _a.success;
            //once done, clear the console
            console.clear();
            clearInterval(interval);
            if (success) {
                resolve();
            }
        };
        if (DEBUG_COMMANDS) {
            (0, util_log_1.log)("".concat(Date.toString(), ": extecuted ").concat(command, " in ").concat(dir));
            resolve();
        }
        else if (command.command) {
            var commandString = getCommand(command);
            if (!commandString) {
                onFinish({ success: true });
                return;
            }
            (0, child_process_1.spawn)(commandString, {
                stdio: debug
                    ? //to see the output from console inside spawned child,
                        //set stdin, link stdout and stderr of child to current process
                        [process.stdin, process.stdout, process.stderr]
                    : "ignore",
                shell: true,
                cwd: dir,
            })
                .on("exit", function (code) {
                var CODE_SUCCESSFUL = 0;
                var ALLOWED_ERRORS = [];
                if (typeof command.command === "string" &&
                    command.command.includes("robocopy")) {
                    //with robocopy,
                    //An Exit Code of 0-7 is success and any value >= 8 indicates that
                    //there was at least one failure during the copy operation.
                    ALLOWED_ERRORS.push(0, 1, 2, 3, 4, 5, 6, 7);
                }
                if (typeof command.command === "string" &&
                    command.command.includes("rmdir")) {
                    //rmdir outputs 2 when it doesn't find the folder to delete
                    ALLOWED_ERRORS.push(2);
                }
                if (code === CODE_SUCCESSFUL ||
                    (code && ALLOWED_ERRORS.includes(code))) {
                    onFinish({ success: true });
                }
                else {
                    onFinish({ success: false });
                    (0, util_log_1.log)(messages.join("\n"));
                    (0, util_log_1.log)("The following command failed: \"".concat(command.command, " (code ").concat(code, ").\""));
                    //process.exit(1);
                }
            })
                //save all output so it can be printed on an error
                .on("message", function (message) {
                messages.push(message.toString());
            })
                .on("error", function (err) {
                onFinish({ success: false });
                (0, util_log_1.log)(messages.join("\n"));
                (0, util_log_1.log)("The following command failed: \"".concat(command.command, "\": \"").concat(err, "\""));
                process.exit(1);
            });
        }
        else if (command.nodeFunction) {
            command.nodeFunction(function () {
                onFinish({ success: true });
            });
        }
        else {
            onFinish({ success: true });
        }
    });
};
var getSpawnCommandsReducer = function (dir, debug) {
    return function (previous, command) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, previous];
                case 1:
                    _a.sent();
                    return [2 /*return*/, executeCommand(command, dir, debug)];
            }
        });
    }); };
};
var commandExistsOrInstall = function (_a) {
    var command = _a.command, installCommand = _a.installCommand, installInstructions = _a.installInstructions, exitIfNotInstalled = _a.exitIfNotInstalled;
    return __awaiter(void 0, void 0, void 0, function () {
        var isAvailable, err_1, installCommandString, ok;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    isAvailable = false;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, command_exists_1.default)(command)];
                case 2:
                    isAvailable = !!(_b.sent());
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _b.sent();
                    (0, util_log_1.log)("Command not found");
                    return [3 /*break*/, 4];
                case 4:
                    installCommandString = installCommand && getCommand(installCommand);
                    if (isAvailable)
                        return [2 /*return*/, true];
                    if (!installCommand) return [3 /*break*/, 7];
                    return [4 /*yield*/, askOk("You don't have ".concat(command, ", but we need it to set up your project. Shall we install it for you, using \"").concat(installCommandString, "\"? \n\n yes/no \n\n"))];
                case 5:
                    ok = _b.sent();
                    if (!ok) return [3 /*break*/, 7];
                    return [4 /*yield*/, executeCommand(installCommand, __dirname, !!isDebug)];
                case 6:
                    _b.sent();
                    return [2 /*return*/, true];
                case 7:
                    (0, util_log_1.log)(installInstructions);
                    if (exitIfNotInstalled) {
                        process.exit(1);
                    }
                    return [2 /*return*/, false];
            }
        });
    });
};
/**
 * replace all variables in a command string with the actual value
 */
var commandReplaceVariables = function (variables) {
    return function (command) {
        if (command) {
            var newCommand = Object.keys(variables).reduce(function (command, variableKey) {
                return command
                    ? command === null || command === void 0 ? void 0 : command.replaceAll("{".concat(variableKey, "}"), variables[variableKey])
                    : "";
            }, getCommand(command)) || "";
            command.command = newCommand;
        }
        return command;
    };
};
var getPushToGitCommands = function (appName, remote) {
    return {
        dir: "".concat(targetDir, "/").concat(appName),
        commands: [
            {
                //command: "rm -rf .git",
                command: removeDirCommandHelper[currentPlatformId](".git"),
                description: "Remove previous git",
            },
            {
                command: "git init",
                description: "Initialising a git repo",
            },
            {
                command: "git branch -M ".concat(mainBranchName),
                description: "Move to '".concat(mainBranchName, "' branch"),
            },
            {
                command: "git add . && git commit -m \"".concat(initialCommitMessage, "\""),
                description: "Creating commit",
            },
            {
                command: "git remote add origin ".concat(remote),
                description: "Adding remote",
                isDisabled: !remote,
            },
            {
                command: "git push -u origin ".concat(mainBranchName),
                description: "Push",
                isDisabled: !remote,
            },
        ],
    };
};
var installRequiredStuff = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: 
            //making sure you have brew, node, npm, yarn, code, git, jq, watchman
            return [4 /*yield*/, commandExistsOrInstall({
                    command: installHelper[currentPlatformId],
                    installInstructions: "Please install ".concat(installHelper[currentPlatformId], ". Go to \"https://brew.sh\" for instructions"),
                    installCommand: {
                        command: '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"',
                        description: "Installing ".concat(installHelper[currentPlatformId]),
                    },
                    exitIfNotInstalled: true,
                })];
            case 1:
                //making sure you have brew, node, npm, yarn, code, git, jq, watchman
                _a.sent();
                return [4 /*yield*/, commandExistsOrInstall({
                        command: "node",
                        installInstructions: "Please run \"".concat(installHelper[currentPlatformId], " install node\" or go to https://formulae.brew.sh/formula/node for instructions"),
                        installCommand: {
                            command: "".concat(installHelper[currentPlatformId], " install node"),
                            description: "Installing node using ".concat(installHelper[currentPlatformId]),
                        },
                        exitIfNotInstalled: true,
                    })];
            case 2:
                _a.sent();
                return [4 /*yield*/, commandExistsOrInstall({
                        command: "npm",
                        installInstructions: "Please install node and npm, see https://docs.npmjs.com/downloading-and-installing-node-js-and-npm",
                        installCommand: {
                            command: "".concat(installHelper[currentPlatformId], " install node"),
                            description: "Installing node using ".concat(installHelper[currentPlatformId]),
                        },
                        exitIfNotInstalled: true,
                    })];
            case 3:
                _a.sent();
                return [4 /*yield*/, commandExistsOrInstall({
                        command: "yarn",
                        installInstructions: "Please install yarn, see https://classic.yarnpkg.com/lang/en/docs/install",
                        installCommand: {
                            command: "npm install --global yarn",
                            description: "Installing yarn",
                        },
                        exitIfNotInstalled: true,
                    })];
            case 4:
                _a.sent();
                return [4 /*yield*/, commandExistsOrInstall({
                        command: "code",
                        exitIfNotInstalled: true,
                        installInstructions: 'Please install VSCode and the code cli command. see https://code.visualstudio.com/docs/editor/command-line \n\n TL;DR: Linux and Windows, the code command comes with a VSCode installation, but on MacOS you need to activate it from within VSCode using "Cmd + Shift + P" and selecting "Install \'code\' command in PATH".',
                    })];
            case 5:
                _a.sent();
                return [4 /*yield*/, commandExistsOrInstall({
                        command: "git",
                        exitIfNotInstalled: true,
                        installInstructions: "Please install git, see https://git-scm.com/book/en/v2/Getting-Started-Installing-Git for instructions.",
                    })];
            case 6:
                _a.sent();
                return [4 /*yield*/, commandExistsOrInstall({
                        command: "jq",
                        exitIfNotInstalled: true,
                        installCommand: {
                            command: "".concat(installHelper[currentPlatformId], " install jq"),
                            description: "Installing jq using ".concat(installHelper[currentPlatformId]),
                        },
                        installInstructions: "Please install jq, see https://stedolan.github.io/jq/download/ for instructions.",
                    })];
            case 7:
                _a.sent();
                return [4 /*yield*/, commandExistsOrInstall({
                        command: "watchman",
                        exitIfNotInstalled: true,
                        installCommand: {
                            command: "".concat(installHelper[currentPlatformId], " install watchman"),
                            description: "Installing watchman using ".concat(installHelper[currentPlatformId]),
                        },
                        installInstructions: "Please install watchman, see https://facebook.github.io/watchman/docs/install.html for instructions.",
                    })];
            case 8:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var getOpenVSCodeCommand = function (appName) { return ({
    command: "code ".concat(targetDir, "/").concat(appName, " --goto README.md:1:1"),
    description: "Opening your project in VSCode",
}); };
var openDocsCommand = {
    command: "open https://docs.sensibleframework.co/localhost:4000",
    description: "Opening the docs for your project",
};
var setNewDefaults = {
    command: "echo ".concat(flagArgumentsString, " > ").concat(settingsLocation),
    description: "Save new setttings",
    isDisabled: !isNewDefaults,
};
var getCommandsWithoutCache = function (_a) {
    var appName = _a.appName, selectedApps = _a.selectedApps, remote = _a.remote;
    return __spreadArray(__spreadArray([
        {
            dir: targetDir,
            commands: [
                {
                    //command: `mkdir ${appName}`,
                    command: makeDirCommandHelper[currentPlatformId](appName),
                    description: "Making folder for your app",
                },
                {
                    //NB: "*" doesn't match hidden files, so we use "." here
                    //`cp -R ${sensibleDir}/templates/base/. ${targetDir}/${appName}`,
                    command: copyCommandHelper[currentPlatformId]("".concat(sensibleDir, "/templates/base/."), "".concat(targetDir, "/").concat(appName)),
                    description: "Copying sensible base",
                },
                {
                    nodeFunction: (0, util_templates_1.findAndRenameTemplateFiles)("".concat(targetDir, "/").concat(appName)),
                    description: "Rename template files to normal files",
                },
            ],
        },
        {
            dir: "".concat(targetDir, "/").concat(appName, "/apps/server"),
            commands: [
                {
                    command: "yarn add cors dotenv md5 reflect-metadata sequelize sequelize-typescript server sqlite3 typescript",
                    description: "Installing server dependencies",
                },
                {
                    command: "yarn add -D @types/node @types/server @types/validator babel-cli eslint ts-node ts-node-dev",
                    description: "Installing server devDependencies",
                },
            ],
        },
        {
            // download all third-party dependencies that are tightly integrated and probably still require some bugfixing in v1
            dir: "".concat(targetDir, "/").concat(appName, "/third-party"),
            commands: isNoThirdParty
                ? []
                : includedRepoSlugs.map(function (slug) { return ({
                    command: "git clone https://github.com/".concat(slug, ".git"),
                    description: "Adding third-party repo: ".concat(slug),
                }); }),
        }
    ], selectedApps.map(function (app) {
        var installFilePath = path_1.default.join(sensibleDir, "templates/apps/".concat(app, ".install.json"));
        var fileString = fs_1.default.existsSync(installFilePath)
            ? fs_1.default.readFileSync(installFilePath, { encoding: "utf8" })
            : "";
        var appsInstallObject = fileString && fileString.length > 0
            ? JSON.parse(fileString)
            : { commands: [], tasks: [] };
        var filledInAppCommands = appsInstallObject.commands.map(commandReplaceVariables({}));
        console.log("[sensible]: " +
            "these are the filled in app commands: " +
            JSON.stringify(filledInAppCommands));
        var defaultAppsCommands = [
            {
                //`cp -R ${sensibleDir}/templates/apps/${app}/. ${targetDir}/${appName}/apps/${app}`
                command: copyCommandHelper[currentPlatformId]("".concat(sensibleDir, "/templates/apps/").concat(app, "/."), "".concat(targetDir, "/").concat(appName, "/apps/").concat(app)),
                description: "Copying ".concat(app, " template"),
                isDisabled: appsInstallObject.commands.length === 0,
            },
        ];
        return {
            //`${targetDir}/${appName}/apps`,
            dir: path_1.default.join(targetDir, appName, "apps"),
            commands: filledInAppCommands.concat(defaultAppsCommands),
        };
    }), true), [
        {
            dir: "".concat(targetDir, "/").concat(appName),
            commands: [getOpenVSCodeCommand(appName)],
        },
        getPushToGitCommands(appName, remote),
        {
            dir: (0, os_1.homedir)(),
            commands: [
                {
                    // NB: -p stands for parents and makes directories recursively
                    //command: "rm -rf .sensible/cache && mkdir -p .sensible/cache",
                    command: removeDirAndRecreateEmptyHelper[currentPlatformId](".sensible/cache"),
                    description: "Creating sensible cache folder",
                },
                {
                    //command: `cp -R ${targetDir}/${appName}/. .sensible/cache`,
                    command: copyCommandHelper[currentPlatformId]("".concat(targetDir, "/").concat(appName, "/."), ".sensible/cache"),
                    description: "Creating cache",
                },
                {
                    command: "echo $(node -e 'log(Date.now())') > .sensible/updatedAt.txt",
                    description: "Add current timestamp to cached files",
                },
                setNewDefaults,
            ],
        },
    ], false);
};
var getCacheCommands = function (_a) {
    var appName = _a.appName, remote = _a.remote;
    return [
        {
            dir: targetDir,
            commands: [
                {
                    command: "mkdir ".concat(appName),
                    description: "Creating your app folder",
                },
                {
                    //command: `cp -R $HOME/.sensible/cache/. ${targetDir}/${appName}`,
                    command: copyCommandHelper[currentPlatformId]("$HOME/.sensible/cache/.", "".concat(targetDir, "/").concat(appName)),
                    description: "Copying sensible from cache",
                },
                getOpenVSCodeCommand(appName),
                openDocsCommand,
                setNewDefaults,
            ],
        },
        getPushToGitCommands(appName, remote),
    ];
};
var getVersionParts = function (versionString) {
    var _a = versionString.split(".").map(Number), major = _a[0], minor = _a[1], patch = _a[2];
    return { major: major, minor: minor, patch: patch };
};
var getPackageVersions = function (name) { return __awaiter(void 0, void 0, void 0, function () {
    var latest, current;
    return __generator(this, function (_a) {
        latest = "";
        current = JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(sensibleDir, "package.json"), "utf8")).version;
        return [2 /*return*/, { latest: latest, current: current }];
    });
}); };
var getUpdateSeverity = function (_a) {
    var latest = _a.latest, current = _a.current;
    return __awaiter(void 0, void 0, void 0, function () {
        var latestParts, currentParts;
        return __generator(this, function (_b) {
            latestParts = getVersionParts(latest);
            currentParts = getVersionParts(current);
            if (latestParts.major > currentParts.major)
                return [2 /*return*/, "major"];
            if (latestParts.minor > currentParts.minor)
                return [2 /*return*/, "minor"];
            if (latestParts.patch > currentParts.patch)
                return [2 /*return*/, "patch"];
            return [2 /*return*/, false];
        });
    });
};
var handleVersionUpdates = function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, latest, current, updateSeverity, shouldUpdate;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, getPackageVersions("sensible")];
            case 1:
                _a = _b.sent(), latest = _a.latest, current = _a.current;
                return [4 /*yield*/, getUpdateSeverity({ latest: latest, current: current })];
            case 2:
                updateSeverity = _b.sent();
                if (!updateSeverity)
                    return [2 /*return*/];
                if (updateSeverity === "patch") {
                    return [2 /*return*/, (0, util_log_1.log)("There's a new version of sensible with version ".concat(latest, ". You are now on version ").concat(current, "."), "FgYellow")];
                }
                return [4 /*yield*/, askOk("Theres a new ".concat(updateSeverity, " version available for Sensible (").concat(latest, "). You're now on version ").concat(current, ". Shall we update? yes/no"))];
            case 3:
                shouldUpdate = _b.sent();
                if (!shouldUpdate) return [3 /*break*/, 5];
                return [4 /*yield*/, executeCommand({
                        description: "Updating sensible",
                        command: "npm install --glopbal sensible@latest",
                    }, targetDir, !!isDebug)];
            case 4:
                _b.sent();
                return [2 /*return*/, process.exit(0)];
            case 5: return [2 /*return*/, (0, util_log_1.log)("Continuing on an older ".concat(updateSeverity, " version. Probably mostly harmless."), "FgGreen")];
        }
    });
}); };
var main = function () { return __awaiter(void 0, void 0, void 0, function () {
    var command, appName, remote, selectedApps, commandsFromFolders;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: 
            //problem with imports package.json ect. do some research to solve this.
            //await handleVersionUpdates();
            return [4 /*yield*/, installRequiredStuff()];
            case 1:
                //problem with imports package.json ect. do some research to solve this.
                //await handleVersionUpdates();
                _a.sent();
                command = argumentsWithoutFlags[2];
                if (!(command === "init")) return [3 /*break*/, 7];
                return [4 /*yield*/, getName()];
            case 2:
                appName = _a.sent();
                return [4 /*yield*/, getRemote(appName)];
            case 3:
                remote = _a.sent();
                return [4 /*yield*/, getApps()];
            case 4:
                selectedApps = _a.sent();
                return [4 /*yield*/, askOpenDocs()];
            case 5:
                _a.sent();
                commandsFromFolders = shouldGetCache
                    ? getCacheCommands({ appName: appName, remote: remote })
                    : getCommandsWithoutCache({ appName: appName, remote: remote, selectedApps: selectedApps });
                return [4 /*yield*/, commandsFromFolders.reduce(function (previous, commandsObject) { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, previous];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/, commandsObject.commands.reduce(getSpawnCommandsReducer(commandsObject.dir, !!isDebug), Promise.resolve())];
                            }
                        });
                    }); }, Promise.resolve())];
            case 6:
                _a.sent();
                return [3 /*break*/, 8];
            case 7:
                (0, util_log_1.log)('please run "sensible init" to use this cli.', "FgCyan");
                _a.label = 8;
            case 8: return [2 /*return*/];
        }
    });
}); };
main();
//# sourceMappingURL=index.js.map