PIX-API
=======

NPM tasks
---------

Execute the NPM `help` to see the available NPM tasks for API.

```
$ npm run help
```

Database
-------------

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
