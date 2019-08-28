const { expect, generateValidRequestAuthorizationHeader, databaseBuilder } = require('../../test-helper');
const createServer = require('../../../server');

describe('Acceptance | Controller | target-profile-controller', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('GET /organizations/{id}/target-profiles', () => {

    context('when user is authenticated', () => {

      let connectedUserId;
      let linkedOrganizationId;

      beforeEach(async () => {
        connectedUserId = databaseBuilder.factory.buildUser().id;
        linkedOrganizationId = databaseBuilder.factory.buildOrganization().id;

        databaseBuilder.factory.buildMembership({
          userId: connectedUserId,
          organizationId: linkedOrganizationId,
        });

        await databaseBuilder.commit();
      });

      afterEach(async () => {
        await databaseBuilder.clean();
      });

      it('should return 200', async () => {
        const options = {
          method: 'GET',
          url: `/api/organizations/${linkedOrganizationId}/target-profiles`,
          headers: { authorization: generateValidRequestAuthorizationHeader(connectedUserId) },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
      });
    });

    context('when user is not authenticated', () => {

      it('should return 401', async () => {
        const options = {
          method: 'GET',
          url: '/api/organizations/1/target-profiles',
          headers: { authorization: 'Bearer mauvais token' },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });
  });
});
