// Errors
const httpErrors = require('../lib/application/http-errors');
// Chai
const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-as-promised'));
chai.use(require('chai-sorted'));
// Sinon
const sinon = require('sinon');
chai.use(require('sinon-chai'));
// Other
const _ = require('lodash');

const EMPTY_BLANK_AND_NULL = ['', '\t \n', null];

afterEach(function() {
  sinon.restore();
  return databaseBuilder.clean();
});

// Knex
const { knex, listAllTableNames } = require('../db/knex-database-connection');

// DatabaseBuilder
const DatabaseBuilder = require('./tooling/database-builder/database-builder');
const databaseBuilder = new DatabaseBuilder({ knex });

// Nock
const nock = require('nock');
nock.disableNetConnect();

// airtableBuilder
const AirtableBuilder = require('./tooling/airtable-builder/airtable-builder');
const airtableBuilder = new AirtableBuilder({ nock });

// Security
const tokenService = require('../lib/domain/services/token-service');

/**
 * @returns string
 */
function generateValidRequestAuthorizationHeader(userId = 1234) {
  const user = {
    id: userId,
  };
  const accessToken = tokenService.createTokenFromUser(user, 'pix');
  return `Bearer ${accessToken}`;
}

async function getCountOfAllRowsInDatabase()
{
  const results = [];
  const tableNames = await listAllTableNames();
  const promises = _.map(tableNames, (tableName) => {
    return knex.raw('SELECT COUNT(*) FROM public."' + tableName + '"').then((result) => {
      results.push({ table : tableName, countRows: _.toInteger(result.rows[0].count) });
    });
  });
  await Promise.all(promises);

  return _.sortBy(results, 'table');
}

async function insertUserWithRolePixMaster() {

  const user = databaseBuilder.factory.buildUser.withPixRolePixMaster({
    id: 1234,
    firstName: 'Super',
    lastName: 'Papa',
    email: 'super.papa@example.net',
    password: 'abcd1234',
  });

  await databaseBuilder.commit();

  return user;
}

async function insertUserWithStandardRole() {
  const user = databaseBuilder.factory.buildUser({
    id: 4444,
    firstName: 'Classic',
    lastName: 'Papa',
    email: 'classic.papa@example.net',
    password: 'abcd1234',
  });

  await databaseBuilder.commit();

  return user;
}

// Hapi
const hFake = {
  response(source) {
    return {
      source,
      code(c) {
        this.statusCode = c;
        return this;
      },
      headers: {},
      header(key, value) {
        this.headers[key] = value;
        return this;
      },
      type(type) {
        this.contentType = type;
        return this;
      },
      takeover() {
        this.isTakeOver = true;
        return this;
      },
      created() {
        this.statusCode = 201;
        return this;
      }
    };
  },
  authenticated(data) {
    return {
      authenticated: data
    };
  },
  redirect(location) {
    return {
      location
    };
  },
  file(path, options) {
    return this.response({ path, options });
  },
  continue: Symbol('continue'),
};

function streamToPromise(stream) {
  return new Promise((resolve, reject) => {
    let totalData = '';
    stream.on('data', (data) => {
      totalData += data;
    });
    stream.on('end', () => {
      resolve(totalData);
    });
    stream.on('error', reject);
  });
}

function catchErr(promiseFn, ctx) {
  return async (...args) => {
    try {
      await promiseFn.call(ctx, ...args);
      return 'should have thrown an error';
    } catch (err) {
      return err;
    }
  };
}

function compareDatabaseObject(evaluatedObject, expectedObject) {
  return expect(_.omit(evaluatedObject, ['id', 'createdAt', 'updatedAt'])).to.deep.equal(_.omit(expectedObject, ['id', 'createdAt', 'updatedAt']));

}

module.exports = {
  EMPTY_BLANK_AND_NULL,
  airtableBuilder,
  expect,
  domainBuilder: require('./tooling/domain-builder/factory'),
  databaseBuilder,
  generateValidRequestAuthorizationHeader,
  getCountOfAllRowsInDatabase,
  hFake,
  HttpTestServer: require('./tooling/server/http-test-server'),
  insertUserWithRolePixMaster,
  insertUserWithStandardRole,
  knex,
  nock,
  sinon,
  streamToPromise,
  catchErr,
  testErr: new Error('Fake Error'),
  testInfraNotFoundErr: new httpErrors.NotFoundError('Fake infra NotFoundError'),
  compareDatabaseObject
};
