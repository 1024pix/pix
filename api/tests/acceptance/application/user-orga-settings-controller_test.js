const { expect, databaseBuilder, generateValidRequestAuthorizationHeader, knex } = require('../../test-helper');
const createServer = require('../../../server');

describe('Acceptance | Controller | user-orga-settings-controller', () => {

  let userId;
  let options;
  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  afterEach(async () => {
    await knex('user-orga-settings').delete();
  });

  describe('PATCH /api/user-orga-settings/{id}', () => {

    let expectedOrganizationId;

    beforeEach(async () => {
      userId = databaseBuilder.factory.buildUser().id;
      const actualOrganizationId = databaseBuilder.factory.buildOrganization().id;
      expectedOrganizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildMembership({ userId, organizationId: actualOrganizationId, organizationRole: 'MEMBER' });
      databaseBuilder.factory.buildMembership({ userId, organizationId: expectedOrganizationId, organizationRole: 'MEMBER' });
      databaseBuilder.factory.buildUserOrgaSettings({ userId, currentOrganizationId: actualOrganizationId });
      await databaseBuilder.commit();

      options = {
        method: 'PATCH',
        url: '/api/user-orga-settings/{id}',
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
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

    describe('Resource access management', () => {

      it('should respond with a 401 - unauthorized access - if user is not authenticated', async () => {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });

    });

    describe('Success case', () => {

      it('should update and return 200 HTTP status code', async () => {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
      });
    });

    describe('Error case', () => {

      it('should respond with a 422 HTTP status code - if user is not member of organization', async () => {
        // given
        options.payload.data.relationships.organization.data.id = 12345;

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(422);
      });
    });
  });

  describe('PUT /api/user-orga-settings/{id}', () => {

    let expectedOrganizationId;

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
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
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

    describe('When user is not authenticated', () => {

      it('should respond with a 401 - unauthorized access', async () => {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });

    });

    describe('When user is authenticated', () => {

      it('should update and return 200 HTTP status code', async () => {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
      });
    });

    describe('When user is not member of organization', () => {

      it('should respond with a 422 HTTP status code', async () => {
        // given
        options.payload.data.relationships.organization.data.id = 12345;

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(422);
      });
    });
  });
});
