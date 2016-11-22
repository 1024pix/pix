/*
 Global variables used int tests.
 */

global.nock = require('nock');
nock.disableNetConnect();

global.sinon = require('sinon');
require('sinon-as-promised');

global.chai = require('chai');
global.expect = chai.expect;
global.chai.use(require('chai-as-promised'));

/*
 Setup Test database (generate api/db/test.sqlite3)
 */

const knexConfig = require('../db/knexfile');
global.knex = require('knex')(knexConfig['test']);
