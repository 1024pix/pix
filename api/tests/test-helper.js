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

import { DatamartBuilder } from '../datamart/datamart-builder/datamart-builder.js';
import { knex as datamartKnex } from '../datamart/knex-database-connection.js';
import { knex as datawarehouseKnex } from '../datawarehouse/knex-database-connection.js';
import { DatabaseBuilder } from '../db/database-builder/database-builder.js';
import { disconnect, knex } from '../db/knex-database-connection.js';
import { createServer } from '../server.js';
import { createMaddoServer } from '../server.maddo.js';
import { PIX_ADMIN } from '../src/authorization/domain/constants.js';
import * as tutorialRepository from '../src/devcomp/infrastructure/repositories/tutorial-repository.js';
import * as missionRepository from '../src/school/infrastructure/repositories/mission-repository.js';
import { config } from '../src/shared/config.js';
import { ORGANIZATION_FEATURE } from '../src/shared/domain/constants.js';
import { Membership } from '../src/shared/domain/models/index.js';
import * as tokenService from '../src/shared/domain/services/token-service.js';
import { featureToggles } from '../src/shared/infrastructure/feature-toggles/index.js';
import * as areaRepository from '../src/shared/infrastructure/repositories/area-repository.js';
import * as challengeRepository from '../src/shared/infrastructure/repositories/challenge-repository.js';
import * as competenceRepository from '../src/shared/infrastructure/repositories/competence-repository.js';
import * as courseRepository from '../src/shared/infrastructure/repositories/course-repository.js';
import * as frameworkRepository from '../src/shared/infrastructure/repositories/framework-repository.js';
import * as skillRepository from '../src/shared/infrastructure/repositories/skill-repository.js';
import * as thematicRepository from '../src/shared/infrastructure/repositories/thematic-repository.js';
import * as tubeRepository from '../src/shared/infrastructure/repositories/tube-repository.js';
import * as customChaiHelpers from './tooling/chai-custom-helpers/index.js';
import * as domainBuilder from './tooling/domain-builder/factory/index.js';
import { jobChai } from './tooling/jobs/expect-job.js';
import { buildLearningContent as learningContentBuilder } from './tooling/learning-content-builder/index.js';
import { increaseCurrentTestTimeout } from './tooling/mocha-tools.js';
import { HttpTestServer } from './tooling/server/http-test-server.js';
import { createTempFile, removeTempFile } from './tooling/temporary-file.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

dotenv.config({ path: `${__dirname}/../.env` });
dayjs.extend(localizedFormat);

chaiUse(chaiAsPromised);
chaiUse(chaiSorted);
chaiUse(sinonChai);

_.each(customChaiHelpers, chaiUse);

chaiUse(jobChai(knex));

const databaseBuilder = await DatabaseBuilder.create({
  knex,
  beforeEmptyDatabase: () => {
    // Sometimes, truncating tables may cause the first ran test to timeout, so
    // we increase the timeout to ensure we don't have flaky tests
    increaseCurrentTestTimeout(2000);
  },
});

const datamartBuilder = await DatamartBuilder.create({
  knex: datamartKnex,
});

// TEMPORARY WORKAROUND
databaseBuilder.factory.learningContent.injectNock(nock);

nock.disableNetConnect();
nock.enableNetConnect('localhost:9090');
const EMPTY_BLANK_AND_NULL = ['', '\t \n', null];

const { ROLES } = PIX_ADMIN;

/* eslint-disable mocha/no-top-level-hooks */

afterEach(async function () {
  restore();
  nock.cleanAll();
  frameworkRepository.clearCache();
  areaRepository.clearCache();
  competenceRepository.clearCache();
  thematicRepository.clearCache();
  tubeRepository.clearCache();
  skillRepository.clearCache();
  challengeRepository.clearCache();
  courseRepository.clearCache();
  tutorialRepository.clearCache();
  missionRepository.clearCache();
  await featureToggles.resetDefaults();
  await datamartBuilder.clean();
  return databaseBuilder.clean();
});

after(async function () {
  return await disconnect();
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

function generateAuthenticatedUserRequestHeaders({
  userId = 1234,
  source = 'pix',
  audience = 'https://app.pix.org',
  acceptLanguage,
} = {}) {
  const url = new URL(audience);
  const protoHeader = url.protocol.slice(0, -1);
  const hostHeader = url.hostname;
  const accessToken = tokenService.createAccessTokenFromUser({ userId, source, audience }).accessToken;

  return {
    authorization: `Bearer ${accessToken}`,
    'x-forwarded-proto': protoHeader,
    'x-forwarded-host': hostHeader,
    ...(acceptLanguage && { 'accept-language': acceptLanguage }),
  };
}

function generateValidRequestAuthorizationHeaderForApplication(clientId = 'client-id-name', source, scope = '') {
  const accessToken = tokenService.createAccessTokenFromApplication(
    clientId,
    source,
    scope,
    config.authentication.secret,
  );
  return `Bearer ${accessToken}`;
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

// We insert a multiple sending feature by default for each new organization created.
// It is under feature for now because we want to be able to deactivate it when asked.
async function insertMultipleSendingFeatureForNewOrganization() {
  const feature = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT);
  await databaseBuilder.commit();
  return feature.id;
}

async function insertPixJuniorFeatureForNewOrganization() {
  databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.LEARNER_IMPORT);
  databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.MISSIONS_MANAGEMENT);
  databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.ORALIZATION_MANAGED_BY_PRESCRIBER);
  databaseBuilder.factory.buildOrganizationLearnerImportFormat({
    name: ORGANIZATION_FEATURE.LEARNER_IMPORT.FORMAT.ONDE,
  });
  await databaseBuilder.commit();
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

async function mockLearningContent(learningContent) {
  const scope = databaseBuilder.factory.learningContent.build(learningContent);
  await databaseBuilder.commit();
  return scope;
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

const preventStubsToBeCalledUnexpectedly = (stubs) => {
  for (const stub of stubs) {
    stub.rejects(
      new Error(
        `Unexpected call to stub "${stub.toString()}" (whether because it should not have been called OR called with wrong arguments)`,
      ),
    );
  }
};
// eslint-disable-next-line mocha/no-exports
export {
  catchErr,
  catchErrSync,
  createMaddoServer,
  createServer,
  createTempFile,
  databaseBuilder,
  datamartBuilder,
  datamartKnex,
  datawarehouseKnex,
  domainBuilder,
  EMPTY_BLANK_AND_NULL,
  expect,
  generateAuthenticatedUserRequestHeaders,
  generateIdTokenForExternalUser,
  generateValidRequestAuthorizationHeaderForApplication,
  hFake,
  HttpTestServer,
  insertMultipleSendingFeatureForNewOrganization,
  insertOrganizationUserWithRoleAdmin,
  insertPixJuniorFeatureForNewOrganization,
  insertUserWithRoleCertif,
  insertUserWithRoleSuperAdmin,
  knex,
  learningContentBuilder,
  MockDate,
  mockLearningContent,
  nock,
  parseJsonStream,
  preventStubsToBeCalledUnexpectedly,
  removeTempFile,
  sinon,
  streamToPromise,
  toStream,
};
