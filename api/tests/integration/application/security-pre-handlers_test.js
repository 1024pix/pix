const { expect, generateValidRequestAuthorizationHeader, databaseBuilder, HttpTestServer } = require('../../test-helper');
const securityPreHandlers = require('../../../lib/application/security-pre-handlers');

describe('Integration | Application | SecurityPreHandlers', () => {
  describe('#checkUserBelongsToOrganization', () => {
    let httpServerTest;

    beforeEach(() => {
      const moduleUnderTest = {
        name: 'security-test',
        register: async function(server) {
          server.route([{
            method: 'GET',
            path: '/check/{id}',
            handler: (r, h) => h.response().code(200),
            config: {
              pre: [{
                method: securityPreHandlers.checkUserBelongsToOrganization,
              }],
            },
          }]);
        },
      };
      httpServerTest = new HttpTestServer(moduleUnderTest);
      httpServerTest.setupAuthentication();
    });

    it('returns 403 when user is not in the organization', async () => {
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { id: organizationId } = databaseBuilder.factory.buildOrganization();
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/check/${organizationId}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },

      };

      const response = await httpServerTest.requestObject(options);

      expect(response.statusCode).to.equal(403);
    });

    it('returns 200 when the user belongs to the organization', async () => {
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { id: organizationId } = databaseBuilder.factory.buildOrganization();
      databaseBuilder.factory.buildMembership({ userId, organizationId });
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/check/${organizationId}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      const response = await httpServerTest.requestObject(options);

      expect(response.statusCode).to.equal(200);
    });
  });
});
