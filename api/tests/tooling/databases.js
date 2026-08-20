import nock from 'nock';

import { DatamartBuilder } from '../../datamart/datamart-builder/datamart-builder.js';
import {
  databaseConnection as datamartDatabaseConnection,
  knex as datamartKnex,
} from '../../datamart/knex-database-connection.js';
import { knex as datawarehouseKnex } from '../../datawarehouse/knex-database-connection.js';
import { DatabaseBuilder } from '../../db/database-builder/database-builder.js';
import { databaseConnection, knex } from '../../db/knex-database-connection.js';

// Init Database builders
const databaseBuilder = await DatabaseBuilder.create({ databaseConnection });
databaseBuilder.factory.learningContent.injectNock(nock); // TEMPORARY WORKAROUND

// Init Datamart builders
const datamartBuilder = await DatamartBuilder.create({
  databaseConnection: datamartDatabaseConnection,
});

export { databaseBuilder, datamartBuilder, datamartKnex, datawarehouseKnex, knex };
