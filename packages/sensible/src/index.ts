#!/usr/bin/env node
//this should run the whole script as a cli

import readline from "readline";
import path from "path";
import { spawn } from "child_process";
import fs from "fs";
import { homedir } from "os";
import { findAndRenameTemplateFiles } from "./util.templates";
import { log } from "./util.log";
import { getPlatformId, platformIds, platformNames } from "./util.platform";
//import latestVersion from "latest-version";

import commandExists from "command-exists";

//InstallHelper
const installHelper = {
  [platformIds.macOS]: "brew",
  [platformIds.windows]: "choco",
  [platformIds.linux]: "brew",
};

const openUrlHelper = {
  [platformIds.macOS]: "open",
  [platformIds.windows]: "start",
  [platformIds.linux]: "open",
};

const copyCommandHelper = {
  [platformIds.macOS]: (source: string, dest: string) => {
    return `cp -R ${source} ${dest}`;
  },
  [platformIds.windows]: (source: string, dest: string) => {
    return `robocopy "${source}" "${dest}" /MIR`;
  },
  [platformIds.linux]: (source: string, dest: string) => {
    return `cp -R ${source} ${dest}`;
  },
};

const removeDirCommandHelper = {
  [platformIds.macOS]: (filePath: string) => {
    return `rm -rf ${filePath}`;
  },
  [platformIds.windows]: (filePath: string) => {
    return `rmdir ${filePath} /s /q`;
  },
  [platformIds.linux]: (filePath: string) => {
    return `rm -rf ${filePath}`;
  },
};

const makeDirCommandHelper = {
  [platformIds.macOS]: (filePath: string) => {
    return `mkdir -p ${filePath}`;
  },
  [platformIds.windows]: (filePath: string) => {
    return `mkdir "${filePath}"`;
  },
  [platformIds.linux]: (filePath: string) => {
    return `mkdir -p ${filePath}`;
  },
};

const removeDirAndRecreateEmptyHelper = {
  [platformIds.macOS]: (filePath: string) => {
    return `rm -rf ${filePath} && mkdir -p ${filePath}`;
  },
  [platformIds.windows]: (filePath: string) => {
    return `if exist "${filePath}" (rmdir "${filePath}" /s /q && mkdir "${filePath}") else (mkdir "${filePath}")`;
  },
  [platformIds.linux]: (filePath: string) => {
    return `rm -rf ${filePath} && mkdir -p ${filePath}`;
  },
};

//TYPE INTERFACES

type OSOrDefault = NodeJS.Platform | "default";

type CommandPerOs = {
  [key in OSOrDefault]?: string;
};

type CommandPerOSOrCommandString = CommandPerOs | string;

type Command = {
  command?: CommandPerOSOrCommandString;
  nodeFunction?: (resolve: () => void) => void;
  description: string;
  isDisabled?: boolean;
};

type CommandsObject = {
  dir: string;
  commands: Command[];
};

const os = process.platform;
const currentPlatformId = getPlatformId(os);

type TaskObject = {};

type InstallObject = {
  commands: Command[];
  tasks: TaskObject[];
};

//CONSTANTS

const DEBUG_COMMANDS = false;
const defaultAppName = "makes-sense";
//test environment should be optional and easy to set up, live should be the default, since we want people to immedeately ship
const initialCommitMessage = "🧠 This Makes Sense";

// currently, this results in a couple of invalid hook calls due to mismatching react* versions
const includedRepoSlugs: string[] = [
  // "Code-From-Anywhere/react-with-native",
  // "Code-From-Anywhere/sensible",
];

const settingsLocation = path.join(homedir(), ".sensible/settings.txt");
const settingsString = fs.existsSync(settingsLocation)
  ? fs.readFileSync(settingsLocation, "utf8")
  : "";
const settingsArray = settingsString.split(" ");

const findArgument = (flag: string) => (arg: string) =>
  arg.startsWith(`--${flag}`);

const getFlagValue = (flag: string | undefined) =>
  flag ? flag.split("=")[1] || true : false;

const getFlag = (flag: string): boolean | string => {
  const foundFlagSettings = settingsArray.find(findArgument(flag));
  const foundFlag = process.argv.find(findArgument(flag));

  const flagValue = getFlagValue(foundFlagSettings) || getFlagValue(foundFlag);
  return flagValue;
};

const isDebug = getFlag("debug");
const isNonInteractive = getFlag("non-interactive");
const isOffline = getFlag("offline");
const isNoCache = getFlag("no-cache") || true; //doesn't work for some reason
const isNoThirdParty = getFlag("no-third-party");
const mainBranch = getFlag("branch");
const cacheDays = getFlag("cache-days");
const isNewDefaults = getFlag("new-defaults");

const cacheDaysNumber =
  typeof cacheDays === "string" && !isNaN(Number(cacheDays))
    ? Number(cacheDays)
    : 1;

const cacheUpdatedAtLocation = path.join(homedir(), ".sensible/updatedAt.txt");
const updatedAt = fs.existsSync(cacheUpdatedAtLocation)
  ? fs.readFileSync(cacheUpdatedAtLocation, "utf8")
  : "0";
const firstTimeCli = updatedAt === "0";

const difference = Date.now() - Number(updatedAt);
const shouldGetCache =
  (difference < 86400 * 1000 * cacheDaysNumber || isOffline) && !isNoCache;

const mainBranchName =
  typeof mainBranch === "string" && mainBranch.length > 0 ? mainBranch : "live";
const sensibleDir = path.resolve(__dirname, "..");
const targetDir = process.cwd();

//UTILITY FUNCTIONS

function slugify(string: string) {
  var a =
    "àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìıİłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;";
  var b =
    "aaaaaaaaaacccddeeeeeeeegghiiiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------";
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

const ask = (question: string): Promise<string> => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  return new Promise((resolve) => {
    rl.question(question, (input) => {
      resolve(input);
      rl.close();
    });
  });
};

const flagArgumentsString = process.argv
  .filter((a) => a.startsWith("--"))
  .join(",");
//.join(" ");
const argumentsWithoutFlags = process.argv.filter((a) => !a.startsWith("--"));

const getArgumentOrAsk = async (
  argumentPosition: number,
  question: string
): Promise<string> => {
  let argument = argumentsWithoutFlags[argumentPosition + 1];
  if (argument && argument.length > 0) return argument;

  if (isNonInteractive) {
    return "";
  }

  return ask(question);
};

const askOk = async (question: string): Promise<boolean> => {
  const answer = await ask(question);
  return ["yes", "y", ""].includes(answer);
};

const getApps = async (): Promise<string[]> => {
  const possibleApps: {
    slug: string;
    description: string;
    default?: boolean;
  }[] = [
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

  const appsString = await ask(
    `Which apps do you want to create boilerplates for? Just press enter for all non-experimental ones 
    
${possibleApps
  .map((possible) => `- ${possible.slug}: ${possible.description}\n`)
  .join("")}\n`
  );

  const apps =
    appsString === ""
      ? possibleApps.filter((x) => x.default).map((x) => x.slug)
      : appsString
          .replaceAll(" ", ",")
          .replaceAll(";", ",")
          .split(",")
          .filter(
            (canditateApp) =>
              possibleApps.map((app) => app.slug).includes(canditateApp) ===
              true
          );

  return apps;
};

const getName = async (): Promise<string> => {
  const name = await getArgumentOrAsk(
    2,
    `What should your sensible app be called? (default: ${defaultAppName})\n`
  );
  const appName = name.length > 0 ? slugify(name) : defaultAppName;

  //making sure we make a folder that doesn't exist yet:
  let n = 0;
  let fullAppName = appName;
  while (fs.existsSync(fullAppName)) {
    n++;
    fullAppName = `${appName}${n}`;
  }
  if (fullAppName !== appName) {
    log(`Using name ${fullAppName} because ${appName} folder already exists.`);
  }
  return fullAppName;
};

const getRemote = async (name: string): Promise<string | null> => {
  const remote = await getArgumentOrAsk(
    3,
    `Where should ${name} be hosted? Provide an URL or a GitHub slug (either "org/repo" or "username/repo")\n`
  );
  return remote.length > 0
    ? remote.includes("https://")
      ? remote
      : `https://github.com/${remote}.git`
    : null;
};

const askOpenDocs = async (): Promise<void> => {
  const openDocs = await askOk(
    `That's all we need to know! Do you want to open the docs while waiting?\n`
  );

  if (openDocs) {
    executeCommand(
      {
        description: "Opening docs",
        command: `${openUrlHelper[currentPlatformId]} https://doc.sensible.to`,
      },
      __dirname,
      false
    );
  }
};

const isCommandPerOs = (
  command: CommandPerOSOrCommandString
): command is CommandPerOs => {
  if (typeof command === "object") {
    return true;
  }
  return false;
};

const getCommand = (command: Command): string | false => {
  if (!command.command) {
    console.log("[sensible]: ", `command returned false`);
    return false;
  }

  if (isCommandPerOs(command.command)) {
    const cmd = command.command[os] || command.command.default!;
    console.log("[sensible]: ", `command returned ${cmd}`);
    return cmd;
  }
  console.log("[sensible]: ", `command returned ${command.command}`);
  return command.command;
};

const executeCommand = (command: Command, dir: string, debug: boolean) => {
  // if command is disabled, immediately resolve so it is skippped.
  if (command.isDisabled) {
    return new Promise<void>((resolve) => {
      resolve();
    });
  }
  //tell the user what is happening, with a dot every second
  process.stdout.write(command.description);
  const interval = setInterval(() => process.stdout.write("."), 5000);

  return new Promise<void>((resolve) => {
    const messages: string[] = [];

    const onFinish = ({ success }: { success: boolean }) => {
      //once done, clear the console
      console.clear();
      clearInterval(interval);
      if (success) {
        resolve();
      }
    };

    if (DEBUG_COMMANDS) {
      log(`${Date.toString()}: extecuted ${command} in ${dir}`);
      resolve();
    } else if (command.command) {
      const commandString = getCommand(command);

      if (!commandString) {
        onFinish({ success: true });
        return;
      }

      spawn(commandString, {
        stdio: debug
          ? //to see the output from console inside spawned child,
            //set stdin, link stdout and stderr of child to current process
            [process.stdin, process.stdout, process.stderr]
          : "ignore",
        shell: true,
        cwd: dir,
      })
        .on("exit", (code) => {
          const CODE_SUCCESSFUL = 0;
          const ALLOWED_ERRORS = [];
          if (
            typeof command.command === "string" &&
            command.command.includes("robocopy")
          ) {
            //with robocopy,
            //An Exit Code of 0-7 is success and any value >= 8 indicates that
            //there was at least one failure during the copy operation.
            ALLOWED_ERRORS.push(0, 1, 2, 3, 4, 5, 6, 7);
          }
          if (
            typeof command.command === "string" &&
            command.command.includes("rmdir")
          ) {
            //rmdir outputs 2 when it doesn't find the folder to delete
            ALLOWED_ERRORS.push(2);
          }
          if (
            code === CODE_SUCCESSFUL ||
            (code && ALLOWED_ERRORS.includes(code))
          ) {
            onFinish({ success: true });
          } else {
            onFinish({ success: false });
            log(messages.join("\n"));

            log(
              `The following command failed: "${command.command} (code ${code})."`
            );
            //process.exit(1);
          }
        })
        //save all output so it can be printed on an error
        .on("message", (message) => {
          messages.push(message.toString());
        })
        .on("error", (err) => {
          onFinish({ success: false });
          log(messages.join("\n"));
          log(`The following command failed: "${command.command}": "${err}"`);
          process.exit(1);
        });
    } else if (command.nodeFunction) {
      command.nodeFunction(() => {
        onFinish({ success: true });
      });
    } else {
      onFinish({ success: true });
    }
  });
};

const getSpawnCommandsReducer =
  (dir: string, debug: boolean) =>
  async (previous: Promise<void>, command: Command) => {
    await previous;
    return executeCommand(command, dir, debug);
  };

const commandExistsOrInstall = async ({
  command,
  installCommand,
  installInstructions,
  exitIfNotInstalled,
}: {
  command: string;
  installCommand?: Command;
  installInstructions: string;
  exitIfNotInstalled?: boolean;
}) => {
  let isAvailable = false;
  try {
    isAvailable = !!(await commandExists(command));
  } catch (err) {
    log("Command not found");
  }

  const installCommandString = installCommand && getCommand(installCommand);
  if (isAvailable) return true;

  if (installCommand) {
    const ok = await askOk(
      `You don't have ${command}, but we need it to set up your project. Shall we install it for you, using "${installCommandString}"? \n\n yes/no \n\n`
    );

    if (ok) {
      await executeCommand(installCommand, __dirname, !!isDebug);
      return true;
    }
  }

  log(installInstructions);

  if (exitIfNotInstalled) {
    process.exit(1);
  }
  return false;
};

/**
 * replace all variables in a command string with the actual value
 */
const commandReplaceVariables =
  (variables: { [key: string]: string }) =>
  (command: Command): Command => {
    if (command) {
      const newCommand =
        Object.keys(variables).reduce((command, variableKey) => {
          return command
            ? command?.replaceAll(`{${variableKey}}`, variables[variableKey])
            : "";
        }, getCommand(command)) || "";

      command.command = newCommand;
    }
    return command;
  };

const getPushToGitCommands = (appName: string, remote: string | null) => {
  return {
    dir: `${targetDir}/${appName}`,
    commands: [
      {
        //command: "rm -rf .git",
        command: removeDirCommandHelper[currentPlatformId](".git"),
        description: "Remove previous git",
      },

      {
        command: `git init`,
        description: "Initialising a git repo",
      },

      {
        command: `git branch -M ${mainBranchName}`,
        description: `Move to '${mainBranchName}' branch`,
      },

      {
        command: `git add . && git commit -m "${initialCommitMessage}"`,
        description: "Creating commit",
      },

      {
        command: `git remote add origin ${remote}`,
        description: "Adding remote",
        isDisabled: !remote,
      },

      {
        command: `git push -u origin ${mainBranchName}`,
        description: "Push",
        isDisabled: !remote,
      },
    ],
  };
};
const installRequiredStuff = async () => {
  //making sure you have brew, node, npm, yarn, code, git, jq, watchman
  await commandExistsOrInstall({
    command: installHelper[currentPlatformId],
    installInstructions: `Please install ${installHelper[currentPlatformId]}. Go to "https://brew.sh" for instructions`,
    installCommand: {
      command:
        '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"',
      description: `Installing ${installHelper[currentPlatformId]}`,
    },
    exitIfNotInstalled: true,
  });
  await commandExistsOrInstall({
    command: "node",
    installInstructions: `Please run "${installHelper[currentPlatformId]} install node" or go to https://formulae.brew.sh/formula/node for instructions`,
    installCommand: {
      command: `${installHelper[currentPlatformId]} install node`,
      description: `Installing node using ${installHelper[currentPlatformId]}`,
    },
    exitIfNotInstalled: true,
  });

  await commandExistsOrInstall({
    command: "npm",
    installInstructions:
      "Please install node and npm, see https://docs.npmjs.com/downloading-and-installing-node-js-and-npm",
    installCommand: {
      command: `${installHelper[currentPlatformId]} install node`,
      description: `Installing node using ${installHelper[currentPlatformId]}`,
    },
    exitIfNotInstalled: true,
  });

  await commandExistsOrInstall({
    command: "yarn",
    installInstructions:
      "Please install yarn, see https://classic.yarnpkg.com/lang/en/docs/install",
    installCommand: {
      command: "npm install --global yarn",
      description: "Installing yarn",
    },
    exitIfNotInstalled: true,
  });

  await commandExistsOrInstall({
    command: "code",
    exitIfNotInstalled: true,
    installInstructions:
      'Please install VSCode and the code cli command. see https://code.visualstudio.com/docs/editor/command-line \n\n TL;DR: Linux and Windows, the code command comes with a VSCode installation, but on MacOS you need to activate it from within VSCode using "Cmd + Shift + P" and selecting "Install \'code\' command in PATH".',
  });

  await commandExistsOrInstall({
    command: "git",
    exitIfNotInstalled: true,
    installInstructions:
      "Please install git, see https://git-scm.com/book/en/v2/Getting-Started-Installing-Git for instructions.",
  });

  await commandExistsOrInstall({
    command: "jq",
    exitIfNotInstalled: true,
    installCommand: {
      command: `${installHelper[currentPlatformId]} install jq`,
      description: `Installing jq using ${installHelper[currentPlatformId]}`,
    },
    installInstructions:
      "Please install jq, see https://stedolan.github.io/jq/download/ for instructions.",
  });

  await commandExistsOrInstall({
    command: "watchman",
    exitIfNotInstalled: true,
    installCommand: {
      command: `${installHelper[currentPlatformId]} install watchman`,
      description: `Installing watchman using ${installHelper[currentPlatformId]}`,
    },
    installInstructions:
      "Please install watchman, see https://facebook.github.io/watchman/docs/install.html for instructions.",
  });
};

const getOpenVSCodeCommand = (appName: string) => ({
  command: `code ${targetDir}/${appName} --goto README.md:1:1`,
  description: "Opening your project in VSCode",
});

const openDocsCommand = {
  command: `open https://docs.sensibleframework.co/localhost:4000`,
  description: "Opening the docs for your project",
};

const setNewDefaults: Command = {
  command: `echo ${flagArgumentsString} > ${settingsLocation}`,
  description: "Save new setttings",
  isDisabled: !isNewDefaults,
};

const getCommandsWithoutCache = ({
  appName,
  selectedApps,
  remote,
}: {
  appName: string;
  selectedApps: string[];
  remote: string | null;
}) => {
  return [
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
          command: copyCommandHelper[currentPlatformId](
            `${sensibleDir}/templates/base/.`,
            `${targetDir}/${appName}`
          ),
          description: "Copying sensible base",
        },

        {
          nodeFunction: findAndRenameTemplateFiles(`${targetDir}/${appName}`),
          description: "Rename template files to normal files",
        },
      ],
    },

    {
      dir: `${targetDir}/${appName}/apps/server`,
      commands: [
        {
          command:
            "yarn add cors dotenv md5 reflect-metadata sequelize sequelize-typescript server sqlite3 typescript",
          description: "Installing server dependencies",
        },
        {
          command:
            "yarn add -D @types/node @types/server @types/validator babel-cli eslint ts-node ts-node-dev",
          description: "Installing server devDependencies",
        },
      ],
    },

    {
      // download all third-party dependencies that are tightly integrated and probably still require some bugfixing in v1
      dir: `${targetDir}/${appName}/third-party`,
      commands: isNoThirdParty
        ? []
        : includedRepoSlugs.map((slug) => ({
            command: `git clone https://github.com/${slug}.git`,
            description: `Adding third-party repo: ${slug}`,
          })),
    },

    // only install selected apps
    ...selectedApps.map((app) => {
      const installFilePath = path.join(
        sensibleDir,
        `templates/apps/${app}.install.json`
      );
      const fileString = fs.existsSync(installFilePath)
        ? fs.readFileSync(installFilePath, { encoding: "utf8" })
        : "";

      const appsInstallObject: InstallObject =
        fileString && fileString.length > 0
          ? JSON.parse(fileString)
          : { commands: [], tasks: [] };

      const filledInAppCommands = appsInstallObject.commands.map(
        commandReplaceVariables({})
      );
      console.log(
        "[sensible]: " +
          "these are the filled in app commands: " +
          JSON.stringify(filledInAppCommands)
      );

      const defaultAppsCommands: Command[] = [
        {
          //`cp -R ${sensibleDir}/templates/apps/${app}/. ${targetDir}/${appName}/apps/${app}`
          command: copyCommandHelper[currentPlatformId](
            `${sensibleDir}/templates/apps/${app}/.`,
            `${targetDir}/${appName}/apps/${app}`
          ),
          description: `Copying ${app} template`,
          isDisabled: appsInstallObject.commands.length === 0,
        },
      ];

      return {
        //`${targetDir}/${appName}/apps`,
        dir: path.join(targetDir, appName, "apps"),
        commands: filledInAppCommands.concat(defaultAppsCommands),
      };
    }),

    {
      dir: `${targetDir}/${appName}`,
      commands: [getOpenVSCodeCommand(appName)],
    },

    getPushToGitCommands(appName, remote),

    {
      dir: homedir(),
      commands: [
        {
          // NB: -p stands for parents and makes directories recursively
          //command: "rm -rf .sensible/cache && mkdir -p .sensible/cache",
          command:
            removeDirAndRecreateEmptyHelper[currentPlatformId](
              ".sensible/cache"
            ),
          description: "Creating sensible cache folder",
        },

        {
          //command: `cp -R ${targetDir}/${appName}/. .sensible/cache`,
          command: copyCommandHelper[currentPlatformId](
            `${targetDir}/${appName}/.`,
            `.sensible/cache`
          ),
          description: "Creating cache",
        },

        {
          command: `echo $(node -e 'log(Date.now())') > .sensible/updatedAt.txt`,
          description: "Add current timestamp to cached files",
        },

        setNewDefaults,
      ],
    },
  ];
};

const getCacheCommands = ({
  appName,
  remote,
}: {
  appName: string;
  remote: string | null;
}) => {
  return [
    {
      dir: targetDir,
      commands: [
        {
          command: `mkdir ${appName}`,
          description: "Creating your app folder",
        },
        {
          //command: `cp -R $HOME/.sensible/cache/. ${targetDir}/${appName}`,
          command: copyCommandHelper[currentPlatformId](
            `$HOME/.sensible/cache/.`,
            `${targetDir}/${appName}`
          ),
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

const getVersionParts = (versionString: string) => {
  const [major, minor, patch] = versionString.split(".").map(Number);
  return { major, minor, patch };
};

const getPackageVersions = async (name: string) => {
  const latest = ""; //await latestVersion(name);
  const current: string = JSON.parse(
    fs.readFileSync(path.resolve(sensibleDir, "package.json"), "utf8")
  ).version;
  return { latest, current };
};

const getUpdateSeverity = async ({
  latest,
  current,
}: {
  latest: string;
  current: string;
}) => {
  const latestParts = getVersionParts(latest);
  const currentParts = getVersionParts(current);

  if (latestParts.major > currentParts.major) return "major";
  if (latestParts.minor > currentParts.minor) return "minor";
  if (latestParts.patch > currentParts.patch) return "patch";
  return false;
};

const handleVersionUpdates = async () => {
  const { latest, current } = await getPackageVersions("sensible");
  const updateSeverity = await getUpdateSeverity({ latest, current });

  if (!updateSeverity) return;

  if (updateSeverity === "patch") {
    return log(
      `There's a new version of sensible with version ${latest}. You are now on version ${current}.`,
      "FgYellow"
    );
  }

  const shouldUpdate = await askOk(
    `Theres a new ${updateSeverity} version available for Sensible (${latest}). You're now on version ${current}. Shall we update? yes/no`
  );

  if (shouldUpdate) {
    await executeCommand(
      {
        description: "Updating sensible",
        command: "npm install --glopbal sensible@latest",
      },
      targetDir,
      !!isDebug
    );

    return process.exit(0);
  }

  return log(
    `Continuing on an older ${updateSeverity} version. Probably mostly harmless.`,
    "FgGreen"
  );
};

const main = async () => {
  //problem with imports package.json ect. do some research to solve this.
  //await handleVersionUpdates();
  await installRequiredStuff();
  const command = argumentsWithoutFlags[2];

  if (command === "init") {
    const appName = await getName();
    const remote = await getRemote(appName);
    const selectedApps = await getApps();

    await askOpenDocs();

    const commandsFromFolders = shouldGetCache
      ? getCacheCommands({ appName, remote })
      : getCommandsWithoutCache({ appName, remote, selectedApps });

    await commandsFromFolders.reduce(
      async (previous: Promise<void>, commandsObject: CommandsObject) => {
        await previous;
        return commandsObject.commands.reduce(
          getSpawnCommandsReducer(commandsObject.dir, !!isDebug),
          Promise.resolve()
        );
      },
      Promise.resolve()
    );
  } else {
    log('please run "sensible init" to use this cli.', "FgCyan");
  }
};
main();
