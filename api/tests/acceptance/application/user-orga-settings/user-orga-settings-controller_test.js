import { expect, databaseBuilder, generateValidRequestAuthorizationHeader } from '../../../test-helper.js';
import { createServer } from '../../../../server.js';

describe('Acceptance | Controller | user-orga-settings-controller', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('PUT /api/user-orga-settings/{id}', function () {
    let userId;
    let expectedOrganizationId;
    let options;

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser().id;

      const actualOrganizationId = databaseBuilder.factory.buildOrganization().id;
      expectedOrganizationId = databaseBuilder.factory.buildOrganization().id;

      databaseBuilder.factory.buildMembership({
        userId,
        organizationId: actualOrganizationId,
        organizationRole: 'MEMBER',
      });
      databaseBuilder.factory.buildMembership({
        userId,
        organizationId: expectedOrganizationId,
        organizationRole: 'MEMBER',
      });

      databaseBuilder.factory.buildUserOrgaSettings({ userId, currentOrganizationId: actualOrganizationId });

      await databaseBuilder.commit();

      options = {
        method: 'PUT',
        url: `/api/user-orga-settings/${userId}`,
        payload: {
          data: {
            relationships: {
              organization: {
                data: {
                  id: expectedOrganizationId,
                  type: 'organizations',
                },
              },
            },
          },
        },
      };
    });

    context('When user is not authenticated', function () {
      it('should respond with a 401 - unauthorized access', async function () {
        // given
        options.headers = { authorization: 'invalid.access.token' };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });

    context('When user is authenticated', function () {
      beforeEach(async function () {
        options.headers = { authorization: generateValidRequestAuthorizationHeader(userId) };
      });

      it('should update and return 200 HTTP status code', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
      });

      context('When user is not member of organization', function () {
        it('should respond with a 422 HTTP status code', async function () {
          // given
          options.payload.data.relationships.organization.data.id = 12345;

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(422);
        });
      });

      context('When user is a disabled member of the organization', function () {
        it('should respond with a 422 HTTP status code', async function () {
          // given
          expectedOrganizationId = databaseBuilder.factory.buildOrganization().id;
          databaseBuilder.factory.buildMembership({
            userId,
            organizationId: expectedOrganizationId,
            disabledAt: new Date(),
          });

          options.payload.data.relationships.organization.data.id = expectedOrganizationId;

          await databaseBuilder.commit();

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(422);
        });
      });
    });
  });
});
