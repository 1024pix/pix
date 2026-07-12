import nock from 'nock';

import { DatamartBuilder } from '../../datamart/datamart-builder/datamart-builder.js';
import { knex as datamartKnex } from '../../datamart/knex-database-connection.js';
import { knex as datawarehouseKnex } from '../../datawarehouse/knex-database-connection.js';
import { DatabaseBuilder } from '../../db/database-builder/database-builder.js';
import { getDb } from '../../db/knex-database-connection.js';

// Init Database builders
const knex = getDb();
const databaseBuilder = await DatabaseBuilder.create({ knex });
databaseBuilder.factory.learningContent.injectNock(nock); // TEMPORARY WORKAROUND

// Init Datamart builders
const datamartBuilder = await DatamartBuilder.create({
  knex: datamartKnex,
});

export { databaseBuilder, datamartBuilder, datamartKnex, datawarehouseKnex, knex };
