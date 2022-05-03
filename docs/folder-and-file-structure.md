# Folder structure

Every Sensible project must adhere the following structure:

- `apps` all applications, including a server, web, and mobile apps
- `packages` all packages that need to be shared between multiple apps
- `third-party` all third-party modules that are being used as dependencies in your project and you are actively working on.
- `docs` markdown files that need to be presented in the Sensible UI to educate the developer of the project. NB: you can also place markdown files anywhere else.
- `assets` any assets that don't belong to an app or package.
- `package.json` the Turbo setup. This file makes it possible to install all modules of all apps and packages with a single `yarn` command.
- `README.md` information about the project, instructions, etc.
- `turbo.json` a [turbo-file](https://turborepo.org) to setup code-sharing functionalities and easy installation and building capabilities.