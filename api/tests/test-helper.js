// Chai
const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-as-promised'));

// Sinon
const sinon = require('sinon');
chai.use(require('sinon-chai'));

// Knex
const knexConfig = require('../db/knexfile');
const knex = require('knex')(knexConfig['test']);

// DatabaseBuilder
const DatabaseBuilder = require('./tooling/database-builder/database-builder');
const databaseBuilder = new DatabaseBuilder({ knex });

// Nock
const nock = require('nock');
nock.disableNetConnect();

// Security
const tokenService = require('../lib/domain/services/token-service');

/**
 * @returns string
 */
function generateValidRequestAuhorizationHeader(userId = 1234) {
  const user = {
    id: userId,
  };
  const accessToken = tokenService.createTokenFromUser(user);
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

module.exports = {
  cleanupUsersAndPixRolesTables,
  expect,
  factory: require('./tooling/factory'),
  databaseBuilder,
  generateValidRequestAuhorizationHeader,
  insertUserWithRolePixMaster,
  insertUserWithStandardRole,
  knex,
  nock,
  sinon,
};
