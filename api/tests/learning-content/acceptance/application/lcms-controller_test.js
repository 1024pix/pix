import Redis from 'ioredis';

import { PIX_ADMIN } from '../../../../src/authorization/domain/constants.js';
import { LearningContentCache } from '../../../../src/shared/infrastructure/caches/learning-content-cache.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  knex,
  mockLearningContent,
} from '../../../test-helper.js';

const { ROLES } = PIX_ADMIN;

describe('Acceptance | Controller | lcms-controller', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('PATCH /api/cache/{model}/{id}', function () {
    describe('Resource access management', function () {
      it('should respond with a 401 - unauthorized access - if user is not authenticated', async function () {
        // given & when
        const response = await server.inject({
          method: 'PATCH',
          url: '/api/cache/challenges/recChallengeId',
          headers: { authorization: 'invalid.access.token' },
          payload: {
            id: 'recChallengeId',
            param: 'updatedModelParam',
          },
        });

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('should respond with a 403 - forbidden access - if user is not a Super Admin', async function () {
        // given
        const nonSuperAdminUserId = 9999;

        // when
        const response = await server.inject({
          method: 'PATCH',
          url: '/api/cache/challenges/recChallengeId',
          headers: { authorization: generateValidRequestAuthorizationHeader(nonSuperAdminUserId) },
          payload: {
            id: 'recChallengeId',
            param: 'updatedModelParam',
          },
        });

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    describe('nominal case', function () {
      beforeEach(function () {
        LearningContentCache.instance = new LearningContentCache(process.env.TEST_REDIS_URL);
      });

      afterEach(async function () {
        await LearningContentCache.instance._underlyingCache.flushAll();
        LearningContentCache.instance = null;
      });

      it('should store patches in Redis and patch the DB for an assign operation', async function () {
        // given
        await mockLearningContent({
          frameworks: [
            { id: 'frameworkId', name: 'old name' },
            { id: 'frameworkId_other', name: 'other name' },
          ],
        });
        const superAdminUserId = databaseBuilder.factory.buildUser.withRole({
          role: ROLES.SUPER_ADMIN,
        }).id;
        await databaseBuilder.commit();
        const payload = {
          id: 'frameworkId',
          name: 'new name',
        };

        // when
        const response = await server.inject({
          method: 'PATCH',
          url: `/api/cache/frameworks/frameworkId`,
          headers: { authorization: generateValidRequestAuthorizationHeader(superAdminUserId) },
          payload,
        });

        // then
        expect(response.statusCode).to.equal(204);
        const redis = new Redis(process.env.TEST_REDIS_URL);
        expect(await redis.lrange('cache:LearningContent:patches', 0, -1)).to.deep.equal([
          JSON.stringify({ operation: 'assign', path: `frameworks[0]`, value: payload }),
        ]);
        const frameworksInDB = await knex.select('*').from('learningcontent.frameworks').orderBy('name');
        expect(frameworksInDB).to.deep.equal([
          { id: 'frameworkId', name: 'new name' },
          { id: 'frameworkId_other', name: 'other name' },
        ]);
      });

      it('should store patches in Redis and patch the DB for a push operation', async function () {
        // given
        await mockLearningContent({
          frameworks: [
            { id: 'frameworkId1', name: 'name 1' },
            { id: 'frameworkId3', name: 'name 3' },
          ],
        });
        const superAdminUserId = databaseBuilder.factory.buildUser.withRole({
          role: ROLES.SUPER_ADMIN,
        }).id;
        await databaseBuilder.commit();
        const payload = {
          id: 'frameworkId2',
          name: 'name 2',
        };

        // when
        const response = await server.inject({
          method: 'PATCH',
          url: `/api/cache/frameworks/frameworkId2`,
          headers: { authorization: generateValidRequestAuthorizationHeader(superAdminUserId) },
          payload,
        });

        // then
        expect(response.statusCode).to.equal(204);
        const redis = new Redis(process.env.TEST_REDIS_URL);
        expect(await redis.lrange('cache:LearningContent:patches', 0, -1)).to.deep.equal([
          JSON.stringify({ operation: 'push', path: `frameworks`, value: payload }),
        ]);
        const frameworksInDB = await knex.select('*').from('learningcontent.frameworks').orderBy('name');
        expect(frameworksInDB).to.deep.equal([
          { id: 'frameworkId1', name: 'name 1' },
          { id: 'frameworkId2', name: 'name 2' },
          { id: 'frameworkId3', name: 'name 3' },
        ]);
      });
    });
  });

  describe('PATCH /api/cache', function () {
    describe('Resource access management', function () {
      it('should respond with a 401 - unauthorized access - if user is not authenticated', async function () {
        // given & when
        const response = await server.inject({
          method: 'PATCH',
          url: '/api/cache',
          headers: { authorization: 'invalid.access.token' },
        });

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('should respond with a 403 - forbidden access - if user is not a Super Admin', async function () {
        // given
        const nonSuperAdminUserId = 9999;

        // when
        const response = await server.inject({
          method: 'PATCH',
          url: '/api/cache',
          headers: { authorization: generateValidRequestAuthorizationHeader(nonSuperAdminUserId) },
        });

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });
});
