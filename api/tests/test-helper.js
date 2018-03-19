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
  return Promise.all([
    knex('users').insert({ id: 1234, firstName: 'Super', lastName: 'Papa', email: 'super.papa@ho.me', password: 'abcd1234' }),
    knex('pix_roles').insert({ id: 4567, name: 'PIX_MASTER' }),
    knex('users_pix_roles').insert({ user_id: 1234, pix_role_id: 4567 }),
  ]);
}

function cleanupUsersAndPixRolesTables() {
  return Promise.all([
    knex('users').delete(),
    knex('pix_roles').delete(),
    knex('users_pix_roles').delete(),
  ]);
}

module.exports = {
  expect,
  sinon,
  knex,
  nock,
  generateValidRequestAuhorizationHeader,
  insertUserWithRolePixMaster,
  cleanupUsersAndPixRolesTables
};
