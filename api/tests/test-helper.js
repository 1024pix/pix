// Mocha
const { describe, it, after, before, beforeEach, afterEach } = require('mocha');

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

module.exports = {
  describe,
  it,
  after,
  before,
  beforeEach,
  afterEach,
  expect,
  sinon,
  knex,
  nock
};
