const { expect, databaseBuilder, generateValidRequestAuthorizationHeader, knex } = require('../../test-helper');
const createServer = require('../../../server');

describe('Acceptance | Controller | user-orga-settings-controller', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  afterEach(async () => {
    await knex('user-orga-settings').delete();
  });

  describe('PUT /api/user-orga-settings/{id}', () => {

    let userId;
    let expectedOrganizationId;
    let options;

    beforeEach(async () => {
      userId = databaseBuilder.factory.buildUser().id;

      const actualOrganizationId = databaseBuilder.factory.buildOrganization().id;
      expectedOrganizationId = databaseBuilder.factory.buildOrganization().id;

      databaseBuilder.factory.buildMembership({ userId, organizationId: actualOrganizationId, organizationRole: 'MEMBER' });
      databaseBuilder.factory.buildMembership({ userId, organizationId: expectedOrganizationId, organizationRole: 'MEMBER' });

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
                  type: 'organizations'
                }
              }
            }
          }
        }
      };
    });

    context('When user is not authenticated', () => {

      it('should respond with a 401 - unauthorized access', async () => {
        // given
        options.headers = { authorization: 'invalid.access.token' };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });

    });

    context('When user is authenticated', () => {

      beforeEach(async () => {
        options.headers = { authorization: generateValidRequestAuthorizationHeader(userId) };
      });

      it('should update and return 200 HTTP status code', async () => {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
      });

      context('When user is not member of organization', () => {

        it('should respond with a 422 HTTP status code', async () => {
          // given
          options.payload.data.relationships.organization.data.id = 12345;

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(422);
        });
      });

      context('When user is a disabled member of the organization', () => {

        it('should respond with a 422 HTTP status code', async () => {
          // given
          expectedOrganizationId = databaseBuilder.factory.buildOrganization().id;
          databaseBuilder.factory.buildMembership({
            userId,
            organizationId: expectedOrganizationId,
            disabledAt: new Date()
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
