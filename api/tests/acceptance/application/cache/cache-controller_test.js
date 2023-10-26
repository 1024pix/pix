import Redis from 'ioredis';
import {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  mockLearningContent,
} from '../../../test-helper.js';
import { createServer } from '../../../../server.js';
import { PIX_ADMIN } from '../../../../lib/domain/constants.js';
import { LearningContentCache } from '../../../../lib/infrastructure/caches/learning-content-cache.js';

const { ROLES } = PIX_ADMIN;

describe('Acceptance | Controller | cache-controller', function () {
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

      it('should store patches in Redis', async function () {
        // given
        mockLearningContent({ frameworks: [{ id: 'frameworkId' }] });
        const superAdminUserId = databaseBuilder.factory.buildUser.withRole({
          role: ROLES.SUPER_ADMIN,
        }).id;
        await databaseBuilder.commit();
        const payload = {
          id: 'frameworkId',
          param: 'updatedFramework',
        };

        // when
        const response = await server.inject({
          method: 'PATCH',
          url: '/api/cache/frameworks/frameworkId',
          headers: { authorization: generateValidRequestAuthorizationHeader(superAdminUserId) },
          payload,
        });

        // then
        expect(response.statusCode).to.equal(204);
        const redis = new Redis(process.env.TEST_REDIS_URL);
        expect(await redis.lrange('cache:LearningContent:patches', 0, -1)).to.deep.equal([
          JSON.stringify({ operation: 'assign', path: 'frameworks[0]', value: payload }),
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
