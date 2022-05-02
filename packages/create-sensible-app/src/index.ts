#!/usr/bin/env node
//this should run the whole script as a cli

import readline from "readline";
import path from "path";
import { spawn } from "child_process";
import fs from "fs";
import { homedir } from "os";

const DEBUG = false;
const defaultAppName = "makes-sense";
//test environment should be optional and easy to set up, live should be the default, since we want people to immedeately ship
const mainBranchName = "live";
const initialCommitMessage = "🧠 This Makes Sense";
const includedRepoSlugs = [
  "Code-From-Anywhere/react-with-native",
  "Code-From-Anywhere/sensible",
];
const hasFlag = (flag: string): boolean => {
  return process.argv.includes(`--${flag}`);
};

const isDebug = hasFlag("debug") || DEBUG;
const isInteractive = hasFlag("interactive");
const isOffline = hasFlag("offline");
const isForceUpdate = hasFlag("force-update");

type Command = {
  command: string;
  description: string;
  isDisabled?: boolean;
};
type CommandsObject = {
  dir: string;
  commands: Command[];
};
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

const getArgumentOrAsk = async (
  argumentPosition: number,
  question: string
): Promise<string> => {
  let firstArgument = process.argv[argumentPosition + 1];
  if (firstArgument && firstArgument.length > 0) return firstArgument;

  if (!isInteractive) {
    return "";
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  return new Promise((resolve) => {
    rl.question(question, (name) => {
      resolve(name);
      rl.close();
    });
  });
};

const getName = async (): Promise<string> => {
  const name = await getArgumentOrAsk(
    1,
    `What should your sensible app be called? (default: ${defaultAppName})\n`
  );
  const appName = name.length > 0 ? slugify(name) : defaultAppName;

  //making sure we make a folder that doesn't exist yet:
  let n = 0;
  let fullAppName = appName;
  while (fs.existsSync(fullAppName)) {
    console.log(`Folder ${fullAppName} already exists...`);
    n++;
    fullAppName = `${appName}${n}`;
  }
  return fullAppName;
};

const getRemote = async (name: string): Promise<string | null> => {
  const remote = await getArgumentOrAsk(
    2,
    `Where should ${name} be hosted? Provide an URL or a GitHub slug (either "org/repo" or "username/repo")\n`
  );
  return remote.length > 0
    ? remote.includes("https://")
      ? remote
      : `https://github.com/${remote}.git`
    : null;
};

const getSpawnCommandsReducer =
  (dir: string, debug: boolean) =>
  async (previous: Promise<void>, command: Command) => {
    await previous;

    // this can be used to test if the commands really are excecuted sequentially with the right parameters.
    // return new Promise<void>((resolve) => {
    //   setTimeout(() => {
    //     resolve(console.log(`extecuted ${command} in ${dir}`));
    //   }, 1000);
    // });

    //tell the user what is happening, with a dot every second
    process.stdout.write(command.description);
    const interval = setInterval(() => process.stdout.write("."), 1000);

    return new Promise<void>((resolve) => {
      const messages: string[] = [];
      spawn(command.command, {
        stdio: debug ? "inherit" : "ignore",
        shell: true,
        cwd: dir,
      })
        .addListener("exit", (code) => {
          //once done, clear the console
          console.clear();
          clearInterval(interval);
          resolve();
        })
        //save all output so it can be printed on an error
        .on("message", (message) => {
          messages.push(message.toString());
        })
        .on("error", (err) => {
          console.log(messages.join("\n"));
          throw `The following command failed: "${command}": "${err}"`;
        });
    });
  };

const checkEnvironmentSetup = () => {
  console.log(`Please make sure you have \n
- Node 18
- code cli
- VSCode
- yarn`);
};

(async () => {
  await checkEnvironmentSetup();
  const appName = await getName();
  const remote = await getRemote(appName);
  const sensibleAssetsDir = path.resolve(__dirname, "..", `assets`);
  const targetDir = process.cwd();

  const cacheUpdatedAtLocation = path.join(
    homedir(),
    ".sensible/updatedAt.txt"
  );
  const updatedAt = fs.existsSync(cacheUpdatedAtLocation)
    ? fs.readFileSync(cacheUpdatedAtLocation, "utf8")
    : "0";
  const difference = Date.now() - Number(updatedAt);
  const shouldGetCache =
    (difference < 86400 * 1000 || isOffline) && !isForceUpdate;

  const openVsCodeAndPush = {
    dir: `${targetDir}/${appName}`,
    commands: [
      {
        command: `code ${targetDir}/${appName} --goto README.md:1:1`,
        description: "Opening your project in VSCode",
      },

      {
        command: `git init`,
        description: "Initialising a git repo",
      },

      {
        command: `git branch -M ${mainBranchName}`,
        description: "Move to 'live' branch",
      },

      {
        command: `git add . && git commit -m "${initialCommitMessage}"`,
        description: "Creating commit",
        isDisabled: !remote,
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
  const commandsWithoutCache: CommandsObject[] = [
    {
      dir: targetDir,
      commands: [
        {
          command: `mkdir ${appName}`,
          description: "Making folder for your app",
        },
        {
          //NB: "*" doesn't match hidden files, so we use "." here
          command: `cp -R ${sensibleAssetsDir}/templates/init/. ${targetDir}/${appName}`,
          description: "Copying sensible template",
        },
      ],
    },

    {
      dir: `${targetDir}/${appName}/apps`,
      commands: [
        {
          command: "yarn create next-app --typescript web",
          description: "Creating next-app",
        },
        {
          command: "npx expo-cli init -t expo-template-blank-typescript app",
          description: "Creating expo-app",
        },
        {
          command: `cp -R ${sensibleAssetsDir}/templates/web/* ${targetDir}/${appName}/apps/web`,
          description: "Copying web template",
        },
        {
          command: `cp -R ${sensibleAssetsDir}/templates/app/* ${targetDir}/${appName}/apps/app`,
          description: "Copying app template",
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
            "yarn add @types/node @types/server @types/validator babel-cli eslint ts-node ts-node-dev",
          description: "Installing server devDependencies",
        },
      ],
    },

    {
      dir: `${targetDir}/${appName}/apps/web`,
      commands: [
        {
          command: "rm -rf .git",
          description: "Removing web git folder",
        },
        {
          command:
            "yarn add core@* ui@* react-query react-with-native react-with-native-form react-with-native-password-input react-with-native-store react-with-native-text-input react-with-native-router next-transpile-modules @badrap/bar-of-progress",
          description: "Installing web dependencies",
        },
        {
          command: "yarn add -D config@* tsconfig@*",
          description: "Installing web devDependencies",
        },
        { command: "mkdir src", description: "Making src directory" },
        {
          command: "mv styles src/styles",
          description: "Moving some stuff around",
        },
        {
          command: "mv pages src/pages",
          description: "Moving some stuff around",
        },
        { command: "touch src/types.ts", description: "Creating files" },
        { command: "touch src/constants.ts", description: "Creating files" },
        {
          command: "npx setup-tailwind-rn",
          description: "Installing tailwind",
        },
      ],
    },

    {
      dir: `${targetDir}/${appName}/apps/app`,
      commands: [
        {
          command: "rm -rf .git",
          description: "Removing git folder",
        },
        {
          command:
            "yarn add core@* ui@* sensible-core@* tailwind-rn react-query react-with-native react-with-native-form react-with-native-store @react-native-async-storage/async-storage react-with-native-text-input react-with-native-router @react-navigation/native @react-navigation/native-stack",
          description: "Installing app dependencies",
        },

        {
          command:
            "yarn add @expo/webpack-config babel-plugin-module-resolver concurrently postcss tailwindcss",
          description: "Installing app devDependencies",
        },
      ],
    },

    {
      // download all third-party dependencies that are tightly integrated and probably still require some bugfixing in v1
      dir: `${targetDir}/${appName}/third-party`,
      commands: includedRepoSlugs.map((slug) => ({
        command: `git clone https://github.com/${slug}.git`,
        description: `Adding third-party repo: ${slug}`,
      })),
    },

    openVsCodeAndPush,

    {
      dir: homedir(),
      commands: [
        {
          command: "rm -rf .sensible/cache && mkdir .sensible/cache",
          description: "Creating sensible cache folder",
        },
        {
          command: `cp -R ${targetDir}/${appName}/. .sensible/cache`,
          description: "creating cache",
        },
        {
          command: `echo $(node -e 'console.log(Date.now())') > .sensible/updatedAt.txt`,
          description: "Add current timestamp to cached files",
        },
      ],
    },
  ];

  const cacheCommands: CommandsObject[] = [
    {
      dir: targetDir,
      commands: [
        {
          command: `mkdir ${appName}`,
          description: "Creating your app folder",
        },
        {
          command: `cp -R $HOME/.sensible/cache/. ${targetDir}/${appName}`,
          description: "Copying sensible from cache",
        },
      ],
    },

    openVsCodeAndPush,
  ];

  const commandsFromFolders = shouldGetCache
    ? cacheCommands
    : commandsWithoutCache;

  commandsFromFolders.reduce(
    async (previous: Promise<void>, commandsObject: CommandsObject) => {
      await previous;
      return commandsObject.commands.reduce(
        getSpawnCommandsReducer(commandsObject.dir, isDebug),
        Promise.resolve()
      );
    },
    Promise.resolve()
  );
})();
