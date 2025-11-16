# ML Data Platform

This is a full-stack application for managing and annotating machine learning data.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [Docker](https://docs.docker.com/get-docker/)

## How to Run

### Quick Start: Automated Setup

For a fast and easy setup, you can use the automated script. This will handle all the necessary steps, from installing dependencies to starting the application.
```bash
./run.sh
```

### Stopping the Application

To stop the application and the database container, you can use the `stop.sh` script.
```bash
./stop.sh
```

### Manual Setup

If you prefer to run the commands manually, follow the steps below.

#### 1. Install Dependencies

First, you need to install all the necessary packages for the project. Run this command from the root directory of the project:
```bash
npm install
```

#### 2. Set Up Environment Variables

Create a `.env` file in the root of the project. You can use the example template provided. Inside this file, add your database connection string:
```
DATABASE_URL="postgres://user:password@host:port/db"
```

Replace `"postgres://user:password@host:port/db"` with your actual database connection string.

#### 3. Start Docker Services

This command will start the PostgreSQL container in detached mode:
```bash
npm run docker:up
```

Or alternatively:
```bash
docker-compose up -d
```

#### 4. Initialize the Database Schema

**⚠️ This step is required only the first time you set up the project or after schema changes.**

This command will synchronize your database schema with the definitions in the code, creating all necessary tables:
```bash
npm run db:push
```

**When to run this command:**
- First time setting up the project
- After pulling changes that modify the database schema
- After manually changing `shared/schema.ts`

#### 5. Run the Application in Development Mode

To start the application for development, which includes features like automatic reloading when you make code changes, use the following command. The application will be accessible at `http://localhost:5006`.
```bash
npm run dev
```

#### 6. Build for Production

When you are ready to deploy your application, you need to create a production build. This command will bundle and optimize your code into a `dist` directory.
```bash
npm run build
```

#### 7. Run in Production Mode

After building the project, you can start it in production mode with this command. This is the command you would use on a live server.
```bash
npm start
```

## Database Commands

To interact with the PostgreSQL database, you can use the following commands.

### List Databases

To see a list of all databases, run the following command:
```bash
docker exec -it ml-data-platform-db-1 psql -U user -d ml-data-platform -c "\l"
```