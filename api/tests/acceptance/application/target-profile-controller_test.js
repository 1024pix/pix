const { expect, generateValidRequestAuhorizationHeader, databaseBuilder } = require('../../test-helper');
const server = require('../../../server');

describe('Acceptance | Controller | target-profile-controller', () => {

  describe('GET /organizations/{id}/target-profiles', () => {

    context('when user is authenticated', () => {

      let connectedUser;
      let linkedOrganization;

      const connectedUserId = 1;
      beforeEach(() => {
        connectedUser = databaseBuilder.factory.buildUser({ id: connectedUserId });
        linkedOrganization = databaseBuilder.factory.buildOrganization();
        databaseBuilder.factory.buildOrganizationAccess({
          userId: connectedUser.id,
          organizationId: linkedOrganization.id
        });

        return databaseBuilder.commit();
      });

      afterEach(() => {
        return databaseBuilder.clean();
      });

      it('should return 200', () => {
        const options = {
          method: 'GET',
          url: `/api/organizations/${linkedOrganization.id}/target-profiles`,
          headers: { authorization: generateValidRequestAuhorizationHeader(connectedUserId) },
        };

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(200);
        });
      });
    });

    context('when user is not authenticated', () => {

      it('should return 401', () => {
        const options = {
          method: 'GET',
          url: '/api/organizations/1/target-profiles',
          headers: { authorization: 'Bearer mauvais token' },
        };

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(401);
        });
      });
    });
  });
});
