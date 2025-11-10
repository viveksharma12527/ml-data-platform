# ML Data Platform - Backend Setup Guide


### Prerequisites
- **Node.js** 
- **PostgreSQL** 

### PostgreSQL Installation
During PostgreSQL installation, make sure to select these components in Stack Builder:
- **pgBouncer** (connection pooling)
- **psqlODBC (64-bit)** (database driver)

### Start PostgreSQL Service

#### Windows:
1. Press `Win + R`, type `services.msc`
2. Find PostgreSQL services (usually named):
   - `postgresql-x64-16`
   - `PostgreSQL Server 16` 
   - `postgresql-16`
3. **Right-click → Start** (if stopped)
4. Or **Right-click → Restart** (if already running)

#### macOS:
- Launch **Postgres.app**

---

## 📥 Installation Steps

### 1. Clone and Navigate
```bash
git clone <repository-url>
cd ml-data-platform/backend
```

### 2. Configure Environment
Copy and modify the `.env` file with your PostgreSQL credentials:
```env
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_NAME=ml_platform
DB_PORT=5432
JWT_SECRET=your_jwt_secret_here
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Setup

#### Create Database:
```bash
psql -U postgres -c "CREATE DATABASE ml_platform;"
```

#### Run Schema:
```bash
psql -U postgres -d ml_platform -f schema.sql
```

### 5. Start Server
```bash
# Development (with auto-restart)
nodemon index.js

```

### 6. Register User & Load Sample Data
1. **Register a user** first through the API
2. **Load sample data**:
```bash
psql -U postgres -d ml_platform -f "sample data.sql"
```

---
## Development Notes

### API Testing with Postman
Since Postman doesn't automatically handle tokens like browsers:

1. **Login** to get JWT token from response
2. **Copy the token** and add to Authorization header:
   ```
   Authorization: Bearer your_token_here
   ```
3. **Use this header** for all protected routes
