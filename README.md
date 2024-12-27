# Automated Web Testing

## About the Project

![The web interface for the project](/docs/assets/interface.png)

This project presents a web application that allows users to create web tests using a _restricted natural language_ or a UI-based editor.

## Getting Started

### Prerequisites

In order to setup the project, you will need a stable version of [Docker](https://docker.com) and [Docker Compose](https://docs.docker.com/compose).

We provide a `compose.yaml` file in order to run containers for each service in this project.

### Docker Installation

After installing Docker and Docker Compose, you can simply go ahead and run the following commands.

```bash
git clone https://github.com/Ghaadyy/fyp.git && cd fyp/ # Clone the repository
docker compose up # Start the services
```

### Manual Installation

If you wish to setup the project manually, you could start by cloning the repository.

```bash
git clone https://github.com/Ghaadyy/fyp.git

cd fyp/
```

#### Setting up the client

```bash
cd client
npm install # install dependencies
npm run dev # serve the React application on port 5173
```

#### Setting up the web API

```bash
cd api
dotnet restore
dotnet build
```

##### Setting up the compiler

However, before running the API, please note the it is **mandatory** to install and build the compiler which can be found in this [repository](https://github.com/Ghaadyy/restricted-nl).

Once you have the `librestricted_nl_lib.(so|dylib|dll)` file, please copy it into the `bin/Debug/net8.0` directory. This will allow the API to invoke a function call to the compiler to execute when responding to requests.

> It is recommended to use the Docker image provided instead of a manual installation.

After setting up the compiler, you can go ahead and run the following command.

```bash
dotnet run
```

> You may require to execute this command as root, this will be fixed in this [issue](https://github.com/Ghaadyy/fyp/issues/5).
