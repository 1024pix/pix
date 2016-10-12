## Installation

Prerequesites: you must have [Node.js](https://nodejs.org/) correctly installed.

```
$ npm install
$ npm run db:migrate
$ npm run db:seed
$ curl http://localhost:3000/api/users
```

## Usage

### `$ npm start`

Run the application in development mode.

### `$ npm run serve`

Run the application in development mode, with sources watching (via [nodemon](http://nodemon.io/)).

### `$ npm run db:migrate`

Update the database by applying new migration scripts  (cf. `/db/migration` files).

### `$ npm run db:seed`

Seed the database with some data (cf. `/db/seed` files).

### `$ npm test`

Run the tests.

### `$ npm run test:serve`

Run the tests in development mode, with sources watching.

### `$ npm run coverage`

Run the test with code coverage (via Istanbul engine) and generate a report in `/coverage` folder.

### `$ npm run lint`

Run ESLint linter on `/app` source folder.


## Database

### Development (default)

By default, the application run in `development` mode and data are stored in a SQLite3 (memory) database.

Once you have run the `npm run db:migrate` NPM task, you should see a generated (and Git ignored) file named `/db/dev.sqlite3`. This file contains all your DB tables and data.

> You can use this file in order to manage your local development DB via a DB tool, such as IntelliJ IDEA Database plugin.  

If you want to reinitialize the data, simply run the `npm run db:seed` task. It will delete the old data and seed the default one.

### Production

If you want to run the DB in production conditions, with PostgreSQL instead of SQLite3, you could easily and quickly setup a PostgreSQL database via the [Vagrant Postgres Dev Box](http://www.pgdevbox.com/).
 
```
# From http://www.pgdevbox.com/#getgoingpart
$ mkdir mypg-project
$ cd mypg-project
$ curl http://www.pgdevbox.com/Vagrantfile -o Vagrantfile
$ vagrant up
```

Then you can setup the DB tables with the following command:

```
$ DATABASE_URL=tcp://vagrant@localhost/vagrant NODE_ENV=production npm run db:migrate
$ DATABASE_URL=tcp://vagrant@localhost/vagrant NODE_ENV=production npm run db:seed
```
