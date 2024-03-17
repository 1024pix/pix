import { PIX_ADMIN } from '../../../../../src/authorization/domain/constants.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  knex,
} from '../../../../test-helper.js';

describe('Acceptance | Application | scoring-configuration-route', function () {
  let server;
  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/competence-for-scoring-configuration', function () {
    describe('when called without being authenticated', function () {
      it('should return a 401', async function () {
        // given
        const options = {
          method: 'POST',
          url: '/api/competence-for-scoring-configuration',
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
          method: 'POST',
          url: '/api/competence-for-scoring-configuration',
          headers: {
            authorization,
          },
          payload: [
            {
              competence: '1.1',
              values: [
                {
                  bounds: {
                    max: -2.2,
                    min: -9.8,
                  },
                  competenceLevel: 0,
                },
              ],
            },
          ],
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    describe('when called with a super admin role', function () {
      describe('when called with an invalid payload', function () {
        it('should return a 400', async function () {
          // given
          const superAdmin = databaseBuilder.factory.buildUser.withRole({
            role: PIX_ADMIN.ROLES.SUPER_ADMIN,
          });

          await databaseBuilder.commit();

          const authorization = generateValidRequestAuthorizationHeader(superAdmin.id);

          const options = {
            method: 'POST',
            url: '/api/competence-for-scoring-configuration',
            headers: {
              authorization,
            },
            payload: {
              lol: 0.5,
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(400);
        });
      });

      describe('when called with a valid payload', function () {
        it('should return a 204 and update the configuration', async function () {
          // given
          const superAdmin = databaseBuilder.factory.buildUser.withRole({
            role: PIX_ADMIN.ROLES.SUPER_ADMIN,
          });

          await databaseBuilder.commit();

          const authorization = generateValidRequestAuthorizationHeader(superAdmin.id);

          const options = {
            method: 'POST',
            url: '/api/competence-for-scoring-configuration',
            headers: {
              authorization,
            },
            payload: [
              {
                competence: '1.1',
                values: [
                  {
                    bounds: {
                      max: -2.2,
                      min: -9.8,
                    },
                    competenceLevel: 0,
                  },
                ],
              },
            ],
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(201);

          const configurations = await knex('competence-scoring-configurations');
          expect(configurations.length).to.equal(1);
        });
      });
    });
  });
});
