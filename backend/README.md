To run this branch :
### Prerequisites

- Node.js 
- PostgreSQL: select thes from the checkboxes when installing  
    - pgBouncer
    - psqlODBC (64 bit)

- run the postgreSQL 
    Windows:
        1. Press Win + R, type services.msc
        2. Find PostgreSQL services (usually named):
            postgresql-x64-16
            PostgreSQL Server 16
            postgresql-16
        3. Right-click → Start (if stopped)
        4. Or Right-click → Restart (if already running)
    
    macOS:
        launch Postgres.app

Clone the code and move to the backend directory in the terminal

modify the .env to your database info [username,password -- the info when installing postgreSQL]

build the dependencies: 
    - In terminal run the command `npm install`

Setup database and schema:
    1. Create database
        In terminal run command `psql -U postgres -c "CREATE DATABASE ml_platform;"`

    2. Run schema
        In terminal run command `psql -U postgres -d ml_platform -f schema.sql`

Now the database is ready to create users, register a new user before running the sample data.

run the server [nodemon index.js or node index.js] and register, use the components ...etc.


after registering a user to fill the database with sample data:
        In terminal run command `psql -U postgres -d ml_platform -f "sample data.sql"`





[POSTMAN is convinet for now until frontend is ready, but it does not send the token automatically as in the browser so you need to copy the token from the login response and added it to the requests autharizaion headers [concatinate "Bearer " and token] ]
