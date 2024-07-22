import 'dayjs/locale/fr.js';

import { Readable } from 'node:stream';
import * as url from 'node:url';

import { Assertion, AssertionError, expect, use as chaiUse, util as chaiUtil } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiSorted from 'chai-sorted';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat.js';
import * as dotenv from 'dotenv';
import iconv from 'iconv-lite';
import _ from 'lodash';
import MockDate from 'mockdate';
import nock from 'nock';
import sinon, { restore } from 'sinon';
import sinonChai from 'sinon-chai';

import { DatabaseBuilder } from '../db/database-builder/database-builder.js';
import { disconnect, knex } from '../db/knex-database-connection.js';
import { Membership } from '../lib/domain/models/index.js';
import { PIX_ADMIN } from '../src/authorization/domain/constants.js';
import { config } from '../src/shared/config.js';
import * as tokenService from '../src/shared/domain/services/token-service.js';
import { LearningContentCache } from '../src/shared/infrastructure/caches/learning-content-cache.js';
import * as customChaiHelpers from './tooling/chai-custom-helpers/index.js';
import * as domainBuilder from './tooling/domain-builder/factory/index.js';
import { buildLearningContent as learningContentBuilder } from './tooling/learning-content-builder/index.js';
import { increaseCurrentTestTimeout } from './tooling/mocha-tools.js';
import { createServerWithTestOidcProvider } from './tooling/server/hapi-server-with-test-oidc-provider.js';
import { HttpTestServer } from './tooling/server/http-test-server.js';
import { createTempFile, removeTempFile } from './tooling/temporary-file.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

dotenv.config({ path: `${__dirname}/../.env` });
dayjs.extend(localizedFormat);

chaiUse(chaiAsPromised);
chaiUse(chaiSorted);
chaiUse(sinonChai);

_.each(customChaiHelpers, chaiUse);

const { apimRegisterApplicationsCredentials, jwtConfig } = config;

const databaseBuilder = await DatabaseBuilder.create({
  knex,
  beforeEmptyDatabase: () => {
    // Sometimes, truncating tables may cause the first ran test to timeout, so
    // we increase the timeout to ensure we don't have flaky tests
    increaseCurrentTestTimeout(2000);
  },
});

nock.disableNetConnect();
nock.enableNetConnect('localhost:9090');
const EMPTY_BLANK_AND_NULL = ['', '\t \n', null];

const { ROLES } = PIX_ADMIN;

/* eslint-disable mocha/no-top-level-hooks */

afterEach(function () {
  restore();
  LearningContentCache.instance.flushAll();
  nock.cleanAll();
  return databaseBuilder.clean();
});

after(function () {
  return disconnect();
});

/* eslint-enable mocha/no-top-level-hooks */

function toStream(data, encoding = 'utf8') {
  return new Readable({
    read() {
      this.push(iconv.encode(data, encoding));
      this.push(null);
    },
  });
}

function generateValidRequestAuthorizationHeader(userId = 1234, source = 'pix') {
  const accessToken = tokenService.createAccessTokenFromUser(userId, source).accessToken;
  return `Bearer ${accessToken}`;
}

function generateValidRequestAuthorizationHeaderForApplication(clientId = 'client-id-name', source, scope) {
  const application = _.find(apimRegisterApplicationsCredentials, { clientId });
  if (application) {
    const accessToken = tokenService.createAccessTokenFromApplication(
      application.clientId,
      source,
      scope,
      jwtConfig[application.source].secret,
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
      statusCode: 302,
      headers: { location },
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

function parseJsonStream(response) {
  return response.result
    .split('\n')
    .filter((row) => row !== '')
    .map((r) => JSON.parse(r));
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

chaiUse(function () {
  Assertion.addMethod('exactlyContain', function (expectedElements) {
    const errorMessage = `expect [${this._obj}] to exactly contain [${expectedElements}]`;
    new Assertion(this._obj, errorMessage).to.deep.have.members(expectedElements);
  });
});

chaiUse(function () {
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
  if (chaiUtil.type(fn) !== 'Function') throw new AssertionError('Invalid fn');

  try {
    fn();
  } catch (err) {
    switch (chaiUtil.type(val).toLowerCase()) {
      case 'undefined':
        return;
      case 'string':
        return expect(err.message).to.equal(val);
      case 'regexp':
        return expect(err.message).to.match(val);
      case 'object':
        return Object.keys(val).forEach(function (key) {
          expect(err).to.have.property(key).and.to.deep.equal(val[key]);
        });
    }

    throw new AssertionError('Invalid val');
  }

  throw new AssertionError('Expected an error');
};

const testErr = new Error('Fake Error');
// eslint-disable-next-line mocha/no-exports
export {
  catchErr,
  catchErrSync,
  createServerWithTestOidcProvider as createServer,
  createTempFile,
  databaseBuilder,
  domainBuilder,
  EMPTY_BLANK_AND_NULL,
  expect,
  generateIdTokenForExternalUser,
  generateValidRequestAuthorizationHeader,
  generateValidRequestAuthorizationHeaderForApplication,
  hFake,
  HttpTestServer,
  insertOrganizationUserWithRoleAdmin,
  insertUserWithRoleCertif,
  insertUserWithRoleSuperAdmin,
  knex,
  learningContentBuilder,
  MockDate,
  mockLearningContent,
  nock,
  parseJsonStream,
  removeTempFile,
  sinon,
  streamToPromise,
  testErr,
  toStream,
};
