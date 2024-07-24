import _ from 'lodash';

import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
} from '../../../../test-helper.js';

describe('Acceptance | Controller | membership-controller', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/admin/memberships', function () {
    let options;
    let userId;
    let organizationId;

    beforeEach(async function () {
      organizationId = databaseBuilder.factory.buildOrganization().id;
      userId = databaseBuilder.factory.buildUser().id;
      const adminUserId = databaseBuilder.factory.buildUser.withRole().id;
      await databaseBuilder.commit();

      options = {
        method: 'POST',
        url: '/api/admin/memberships',
        payload: {
          data: {
            type: 'memberships',
            attributes: {},
            relationships: {
              user: {
                data: {
                  type: 'users',
                  id: userId,
                },
              },
              organization: {
                data: {
                  type: 'organizations',
                  id: organizationId,
                },
              },
            },
          },
        },
        headers: {
          authorization: generateValidRequestAuthorizationHeader(adminUserId),
        },
      };
    });

    context('Success cases', function () {
      it('should return the created membership', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(201);
        expect(_.omit(response.result, ['included', 'data.id'])).to.deep.equal({
          data: {
            type: 'organization-memberships',
            attributes: {
              'organization-role': 'ADMIN',
            },
            relationships: {
              user: {
                data: {
                  type: 'users',
                  id: userId.toString(),
                },
              },
            },
          },
        });
      });

      context('When a membership is disabled', function () {
        it('should be able to recreate it', async function () {
          // given
          databaseBuilder.factory.buildMembership({ userId, organizationId, disabledAt: new Date() });
          await databaseBuilder.commit();

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(201);
        });
      });

      context('When a membership is not disabled', function () {
        it('should not be able to recreate it', async function () {
          // given
          databaseBuilder.factory.buildMembership({ userId, organizationId });
          await databaseBuilder.commit();

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(400);
        });
      });
    });
  });
});
