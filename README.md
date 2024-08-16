# Vite Microfrontend CLI

A command-line interface tool for quickly setting up microfrontend projects using Vite and Module Federation with React.

## Features

- Create a main host application
- Generate multiple microfrontend projects
- Automatically configure Vite and Module Federation
- Set up basic React components for each microfrontend
- Create a workspace structure for easy management of all projects

## Usage

To use the CLI tool, navigate to your preferred directory in your terminal and run:

```bash
npx vite-microfrontend-cli <main-project-name> [options]
```

### Arguments

| Argument              | Description                         |
| --------------------- | ----------------------------------- |
| `<main-project-name>` | Name of the main project (required) |

### Options

| Option                  | Description                                     |
| ----------------------- | ----------------------------------------------- |
| `-n, --number <number>` | Number of microfrontends to create (default: 1) |

### Example

To create a main project named "my-app" with 3 microfrontends:

```bash
npx vite-microfrontend-cli my-app -n 3
```

This will:

1. Prompt you for names for each microfrontend project
2. Create a workspace directory named `my-app-workspace`
3. Create the specified number of microfrontend projects within the workspace
4. Create the main host application within the workspace
5. Set up Vite configuration for each project
6. Configure Module Federation
7. Create basic React components
8. Set up a parent `package.json` for managing all projects

## Project Structure

After running the command, you'll have the following project structure:

```
my-app-workspace/
├── package.json
├── my-app-host/           # Main host application
├── my-app-microfrontend1/ # First microfrontend
├── my-app-microfrontend2/ # Second microfrontend
└── my-app-microfrontend3/ # Third microfrontend
```

Each project will be set up with Vite and configured for Module Federation.

## Development

To start development, navigate to the workspace directory and run:

```bash
npm run preview-all
```

**Remember to run the remote application and host application in Preview mode when developing instead of Development mode to get the file serving working.**

so running `npx vite-microfrontend-cli <main-project-name> [options]` installs dependencies for all projects, builds them. You don't need to run `npm run install-all` or `npm run build-all` separately unless you want to perform these steps individually.

If you do want to run the steps separately, you can use:

```bash
npm run install-all
npm run build-all
npm run preview-all
```

You can also manage each project individually:

1. Navigate to a specific project folder (e.g., `cd my-app-host` or `cd my-app-microfrontend1`)
2. Run the following commands as needed:

```bash
npm install    # Install dependencies for this project
npm run build  # Build this project
npm run dev    # Start the development server for this project
```

## Building for Production

To build all projects for production, run:

```bash
npm run build-all
```

in the workspace directory.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Troubleshooting

If you encounter any issues during setup or execution, please check the following:

1. Ensure you have the latest version of Node.js and npm installed.
2. Make sure you have sufficient permissions to create directories and install packages.
3. You can connect with me at https://www.linkedin.com/in/ujjwal-tiwari202/

## Author

Ujjwal Tiwari

## License

This project is licensed under the MIT License.
