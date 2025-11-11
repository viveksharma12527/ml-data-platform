# ML Data Platform

This is a full-stack application for managing and annotating machine learning data.

## How to Run

To run this project, you will need to execute a series of commands in your terminal.

### 1. Install Dependencies

First, you need to install all the necessary packages for the project. Run this command from the root directory of the project:

```bash
npm install
```

### 2. Set Up Environment Variables

Next, you need to configure your database connection. Create a new file named `.env` in the root of the project. Inside this file, add the following line, but be sure to replace `"postgres://user:password@host:port/db"` with your actual database connection string:

```
DATABASE_URL="postgres://user:password@host:port/db"
```

### 3. Initialize the Database Schema

**⚠️ This step is required only the first time you set up the project or after schema changes.**

This command will synchronize your database schema with the definitions in the code, creating all necessary tables:
```bash
npm run db:push
```

**When to run this command:**
- First time setting up the project
- After pulling changes that modify the database schema
- After manually changing `shared/schema.ts`

### 4. Run the Application in Development Mode

To start the application for development, which includes features like automatic reloading when you make code changes, use the following command. The application will be accessible at `http://localhost:5006`.

```bash
npm run dev
```

### 5. Build for Production

When you are ready to deploy your application, you need to create a production build. This command will bundle and optimize your code into a `dist` directory.

```bash
npm run build
```

### 6. Run in Production Mode

After building the project, you can start it in production mode with this command. This is the command you would use on a live server.

```bash
npm start