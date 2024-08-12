# Vite Microfrontend CLI

A command-line interface tool for quickly setting up microfrontend projects using Vite and Module Federation with React.

## Features

- Create a main host application
- Generate multiple microfrontend projects
- Automatically configure Vite and Module Federation
- Set up basic React components for each microfrontend

## Usage

You can use this tool without installing it globally by using `npx`. Run the following command:

```bash
npx vite-microfrontend-cli <main-project-name> [options]
```

### Arguments

| Argument | Description |
|----------|-------------|
| `<main-project-name>` | Name of the main project (required) |

### Options

| Option | Description |
|--------|-------------|
| `-n, --number <number>` | Number of microfrontends to create (default: 1) |
| `-v, --version` | Output the version number |
| `-h, --help` | Display help for command |

### Example

To create a main project named "my-app" with 3 microfrontends:

```bash
npx vite-microfrontend-cli my-app -n 3
```

This will:
1. Prompt you for names for each microfrontend project
2. Create the main host application
3. Create the specified number of microfrontend projects
4. Set up Vite configuration for each project
5. Configure Module Federation
6. Create basic React components

## Project Structure

After running the command, you'll have the following project structure:

```
my-app-host/           # Main host application
my-app-microfrontend1/ # First microfrontend
my-app-microfrontend2/ # Second microfrontend
my-app-microfrontend3/ # Third microfrontend
```

Each project will be set up with Vite and configured for Module Federation.

## Development

To start development, navigate to each project directory and run:

```bash
npm install
npm run dev
```

Make sure to start all microfrontend projects before starting the host application.

## Building for Production

To build the projects for production, run:

```bash
npm run build
```

in each project directory.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Author

Ujjwal Tiwari

## License

This project is licensed under the MIT License.
