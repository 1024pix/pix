// Errors
const domainErrors = require('../lib/domain/errors');
const infraErrors = require('../lib/infrastructure/errors');
// Chai
const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-as-promised'));
chai.use(require('chai-sorted'));

// Sinon
const sinon = require('sinon');
chai.use(require('sinon-chai'));

afterEach(function() {
  sinon.restore();
});

// Knex
const knexConfig = require('../db/knexfile');
const { environment } = require('../lib/settings');
const knex = require('knex')(knexConfig[environment]);

// DatabaseBuilder
const DatabaseBuilder = require('./tooling/database-builder/database-builder');
const databaseBuilder = new DatabaseBuilder({ knex });

// Nock
const nock = require('nock');
nock.disableNetConnect();

// airtableBuilde
const AirtableBuilder = require('./tooling/airtable-builder/airtable-builder');
const airtableBuilder = new AirtableBuilder({ nock });

// Security
const tokenService = require('../lib/domain/services/token-service');

/**
 * @returns string
 */
function generateValidRequestAuhorizationHeader(userId = 1234) {
  const user = {
    id: userId,
  };
  const accessToken = tokenService.createTokenFromUser(user, 'pix');
  return `Bearer ${accessToken}`;
}

function insertUserWithRolePixMaster() {
  let userId;

  return knex('users').insert({
    id: 1234,
    firstName: 'Super',
    lastName: 'Papa',
    email: 'super.papa@example.net',
    password: 'abcd1234',
  }).returning('id')
    .then((insertUserId) => {
      userId = insertUserId[0];
      return knex('pix_roles').insert({ name: 'PIX_MASTER' }).returning('id');
    })
    .then((insertRoleId) => {
      return knex('users_pix_roles').insert({ user_id: userId, pix_role_id: insertRoleId[0] });
    });
}

function insertUserWithStandardRole() {
  return knex('users').insert({
    id: 4444,
    firstName: 'Classic',
    lastName: 'Papa',
    email: 'classic.papa@example.net',
    password: 'abcd1234',
  }).returning('id');
}

function cleanupUsersAndPixRolesTables() {
  return knex('users_pix_roles').delete()
    .then(() => Promise.all([
      knex('users').delete(),
      knex('pix_roles').delete(),
    ]));
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
};

function streamToPromise(stream) {
  return new Promise((resolve, reject) => {
    let totalData = '';
    stream.on('data', (data) => { totalData += data; });
    stream.on('end', () => {
      resolve(totalData);
    });
    stream.on('error', reject);
  });
}

module.exports = {
  airtableBuilder,
  cleanupUsersAndPixRolesTables,
  expect,
  domainBuilder: require('./tooling/domain-builder/factory'),
  databaseBuilder,
  generateValidRequestAuhorizationHeader,
  hFake,
  HttpTestServer: require('./tooling/server/http-test-server'),
  insertUserWithRolePixMaster,
  insertUserWithStandardRole,
  knex,
  nock,
  sinon,
  streamToPromise,
  testErr: new Error('Fake Error'),
  testDomainNotFoundErr: new domainErrors.NotFoundError('Fake domain NotFoundError'),
  testInfraNotFoundErr: new infraErrors.NotFoundError('Fake infra NotFoundError')
};
