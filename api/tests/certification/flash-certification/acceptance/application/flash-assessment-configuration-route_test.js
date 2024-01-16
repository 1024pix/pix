import { createServer } from '../../../../../server.js';
import { databaseBuilder, expect, generateValidRequestAuthorizationHeader } from '../../../../test-helper.js';
import { PIX_ADMIN } from '../../../../../src/authorization/domain/constants.js';

describe('Acceptance | Application | flash-assessment-configuration-route', function () {
  let server;
  beforeEach(async function () {
    server = await createServer();
  });
  describe('GET /api/flash-assessment-configuration', function () {
    describe('when called without being authenticated', function () {
      it('should return a 401', async function () {
        // given
        const options = {
          method: 'GET',
          url: '/api/flash-assessment-configuration',
        };
        // when
        const response = await server.inject(options);
        // then
        expect(response.statusCode).to.equal(401);
      });
    });

    describe('when called without a super admin role', function () {
      it('should return a 403', async function () {
        // given
        const authorization = generateValidRequestAuthorizationHeader();

        const options = {
          method: 'GET',
          url: '/api/flash-assessment-configuration',
          headers: {
            authorization,
          },
        };
        // when
        const response = await server.inject(options);
        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    describe('when called with a super admin role', function () {
      describe('when there is an available configuration', function () {
        it('should return a 200', async function () {
          // given
          const warmUpLength = 12;
          const superAdmin = databaseBuilder.factory.buildUser.withRole({
            role: PIX_ADMIN.ROLES.SUPER_ADMIN,
          });

          databaseBuilder.factory.buildFlashAlgorithmConfiguration({
            createdAt: new Date('2020-01-01'),
          });

          databaseBuilder.factory.buildFlashAlgorithmConfiguration({
            createdAt: new Date('2021-01-01'),
            warmUpLength,
          });

          await databaseBuilder.commit();

          const authorization = generateValidRequestAuthorizationHeader(superAdmin.id);

          const options = {
            method: 'GET',
            url: '/api/flash-assessment-configuration',
            headers: {
              authorization,
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
          expect(JSON.parse(response.payload).warmUpLength).to.equal(warmUpLength);
        });
      });
    });
  });
});
