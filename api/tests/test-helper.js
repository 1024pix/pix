const _ = require('lodash');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
chai.use(require('chai-as-promised'));
chai.use(require('chai-sorted'));
chai.use(require('sinon-chai'));
const cache = require('../lib/infrastructure/caches/learning-content-cache');
const { livretScolaireAuthentication } = require('../lib/config');

const { knex } = require('../db/knex-database-connection');

const DatabaseBuilder = require('../db/database-builder/database-builder');
const databaseBuilder = new DatabaseBuilder({ knex });

const nock = require('nock');
nock.disableNetConnect();

const learningContentBuilder = require('./tooling/learning-content-builder');

const tokenService = require('../lib/domain/services/token-service');
const EMPTY_BLANK_AND_NULL = ['', '\t \n', null];

afterEach(function() {
  sinon.restore();
  cache.flushAll();
  nock.cleanAll();
  return databaseBuilder.clean();
});

function generateValidRequestAuthorizationHeader(userId = 1234, source = 'pix') {
  const accessToken = tokenService.createAccessTokenFromUser(userId, source);
  return `Bearer ${accessToken}`;
}

function generateValidRequestAuthorizationHeaderForApplication(clientId = 'client-id-name', source = 'osmose', scope = 'scope') {
  const accessToken = tokenService.createAccessTokenFromApplication(clientId, source, scope, livretScolaireAuthentication.secret);
  return `Bearer ${accessToken}`;
}

function generateIdTokenForExternalUser(externalUser) {
  return tokenService.createIdTokenForUserReconciliation(externalUser);
}

async function insertUserWithRolePixMaster() {
  const user = databaseBuilder.factory.buildUser.withPixRolePixMaster({
    id: 1234,
    firstName: 'Super',
    lastName: 'Papa',
    email: 'super.papa@example.net',
    password: 'Password123',
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
      },
    };
  },
  authenticated(data) {
    return {
      authenticated: data,
    };
  },
  redirect(location) {
    return {
      location,
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

chai.use((chai) => {
  const Assertion = chai.Assertion;

  Assertion.addMethod('exactlyContain', function(expectedElements) {
    const errorMessage = `expect [${this._obj}] to exactly contain [${expectedElements}]`;
    new Assertion(this._obj, errorMessage).to.have.members(expectedElements);
  });
});

chai.use((chai) => {
  const Assertion = chai.Assertion;

  Assertion.addMethod('exactlyContainInOrder', function(expectedElements) {
    const errorMessage = `expect [${this._obj}] to exactly contain in order [${expectedElements}]`;

    new Assertion(this._obj, errorMessage).to.deep.equal(expectedElements);
  });
});

function mockLearningContent(learningContent) {
  nock('https://lcms-test.pix.fr/api')
    .get('/releases/latest')
    .matchHeader('Authorization', 'Bearer test-api-key')
    .reply(200, { content: learningContent });
}

module.exports = {
  EMPTY_BLANK_AND_NULL,
  expect,
  domainBuilder: require('./tooling/domain-builder/factory'),
  databaseBuilder,
  generateValidRequestAuthorizationHeader,
  generateValidRequestAuthorizationHeaderForApplication,
  generateIdTokenForExternalUser,
  hFake,
  HttpTestServer: require('./tooling/server/http-test-server'),
  insertUserWithRolePixMaster,
  knex,
  nock,
  sinon,
  streamToPromise,
  catchErr,
  testErr: new Error('Fake Error'),
  compareDatabaseObject,
  mockLearningContent,
  learningContentBuilder,
};
