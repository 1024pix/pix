require('dotenv').config({ path: `${__dirname}/../.env` });
import _ from 'lodash';
import MockDate from 'mockdate';
import chai from 'chai';
const expect = chai.expect;
import sinon from 'sinon';
chai.use(require('chai-as-promised'));
chai.use(require('chai-sorted'));
chai.use(require('sinon-chai'));
import customChaiHelpers from './tooling/chai-custom-helpers/index';
_.each(customChaiHelpers, chai.use);
import cache from '../lib/infrastructure/caches/learning-content-cache';
import { graviteeRegisterApplicationsCredentials, jwtConfig } from '../lib/config';
import { knex, disconnect } from '../db/knex-database-connection';
import DatabaseBuilder from '../db/database-builder/database-builder';
const databaseBuilder = new DatabaseBuilder({ knex });

import nock from 'nock';
nock.disableNetConnect();

import learningContentBuilder from './tooling/learning-content-builder';
import tokenService from '../lib/domain/services/token-service';
import Membership from '../lib/domain/models/Membership';
const EMPTY_BLANK_AND_NULL = ['', '\t \n', null];

import { PIX_ADMIN } from '../lib/domain/constants';

const { ROLES: ROLES } = PIX_ADMIN;

import { createTempFile, removeTempFile } from './tooling/temporary-file';

/* eslint-disable mocha/no-top-level-hooks */
afterEach(function () {
  sinon.restore();
  cache.flushAll();
  nock.cleanAll();
  return databaseBuilder.clean();
});

after(function () {
  return disconnect();
});
/* eslint-enable mocha/no-top-level-hooks */

function generateValidRequestAuthorizationHeader(userId = 1234, source = 'pix') {
  const accessToken = tokenService.createAccessTokenFromUser(userId, source).accessToken;
  return `Bearer ${accessToken}`;
}

function generateValidRequestAuthorizationHeaderForApplication(clientId = 'client-id-name', source, scope) {
  const application = _.find(graviteeRegisterApplicationsCredentials, { clientId });
  if (application) {
    const accessToken = tokenService.createAccessTokenFromApplication(
      application.clientId,
      source,
      scope,
      jwtConfig[application.source].secret
    );
    return `Bearer ${accessToken}`;
  }
}

function generateIdTokenForExternalUser(externalUser) {
  return tokenService.createIdTokenForUserReconciliation(externalUser);
}

async function insertUserWithRoleSuperAdmin() {
  const user = databaseBuilder.factory.buildUser.withRole({
    id: 1234,
    firstName: 'Super',
    lastName: 'Papa',
    email: 'super.papa@example.net',
    password: 'Password123',
  });

  await databaseBuilder.commit();

  return user;
}

async function insertUserWithRoleCertif() {
  const user = databaseBuilder.factory.buildUser.withRole({
    id: 1234,
    firstName: 'Certif',
    lastName: 'Power',
    email: 'certif.power@example.net',
    password: 'Pix123',
    role: ROLES.CERTIF,
  });

  await databaseBuilder.commit();

  return user;
}

async function insertOrganizationUserWithRoleAdmin() {
  const adminUser = databaseBuilder.factory.buildUser();
  const organization = databaseBuilder.factory.buildOrganization();
  databaseBuilder.factory.buildMembership({
    userId: adminUser.id,
    organizationId: organization.id,
    organizationRole: Membership.roles.ADMIN,
  });

  await databaseBuilder.commit();

  return { adminUser, organization };
}

// Hapi
const hFake = {
  response(source) {
    return {
      statusCode: 200,
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
    } catch (err) {
      return err;
    }
    throw new Error('Expected an error, but none was thrown.');
  };
}

function catchErrSync(fn, ctx) {
  return (...args) => {
    try {
      fn.call(ctx, ...args);
    } catch (err) {
      return err;
    }
    throw new Error('Expected an error, but none was thrown.');
  };
}

chai.use(function (chai) {
  const Assertion = chai.Assertion;

  Assertion.addMethod('exactlyContain', function (expectedElements) {
    const errorMessage = `expect [${this._obj}] to exactly contain [${expectedElements}]`;
    new Assertion(this._obj, errorMessage).to.deep.have.members(expectedElements);
  });
});

chai.use(function (chai) {
  const Assertion = chai.Assertion;

  Assertion.addMethod('exactlyContainInOrder', function (expectedElements) {
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

// Inspired by what is done within chai project itself to test assertions
// https://github.com/chaijs/chai/blob/main/test/bootstrap/index.js
global.chaiErr = function globalErr(fn, val) {
  if (chai.util.type(fn) !== 'function') throw new chai.AssertionError('Invalid fn');

  try {
    fn();
  } catch (err) {
    switch (chai.util.type(val).toLowerCase()) {
      case 'undefined':
        return;
      case 'string':
        return chai.expect(err.message).to.equal(val);
      case 'regexp':
        return chai.expect(err.message).to.match(val);
      case 'object':
        return Object.keys(val).forEach(function (key) {
          chai.expect(err).to.have.property(key).and.to.deep.equal(val[key]);
        });
    }

    throw new chai.AssertionError('Invalid val');
  }

  throw new chai.AssertionError('Expected an error');
};

export default {
  EMPTY_BLANK_AND_NULL,
  expect,
  domainBuilder: require('./tooling/domain-builder/factory'),
  databaseBuilder,
  generateValidRequestAuthorizationHeader,
  generateValidRequestAuthorizationHeaderForApplication,
  generateIdTokenForExternalUser,
  hFake,
  HttpTestServer: require('./tooling/server/http-test-server'),
  insertOrganizationUserWithRoleAdmin,
  insertUserWithRoleSuperAdmin,
  insertUserWithRoleCertif,
  knex,
  nock,
  sinon,
  MockDate,
  streamToPromise,
  catchErr,
  catchErrSync,
  testErr: new Error('Fake Error'),
  mockLearningContent,
  learningContentBuilder,
  createTempFile,
  removeTempFile,
};
