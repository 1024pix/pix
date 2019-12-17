const { expect, generateValidRequestAuthorizationHeader, nock, databaseBuilder } = require('../../test-helper');
const createServer = require('../../../server');
const cache = require('../../../lib/infrastructure/caches/learning-content-cache');

describe('Acceptance | Controller | target-profile-controller', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  afterEach(() => {
    cache.flushAll();
  });

  describe('GET /organizations/{id}/target-profiles', () => {

    context('when user is authenticated', () => {

      let user;
      let linkedOrganization;

      beforeEach(async () => {
        nock.cleanAll();
        nock('https://api.airtable.com')
          .get('/v0/test-base/Acquis')
          .query(true)
          .reply(200, {});
        user = databaseBuilder.factory.buildUser({});
        linkedOrganization = databaseBuilder.factory.buildOrganization({});
        databaseBuilder.factory.buildMembership({
          userId: user.id,
          organizationId: linkedOrganization.id,
        });

        await databaseBuilder.commit();
      });

      afterEach(() => {
        nock.cleanAll();
      });

      it('should return 200', async () => {
        const options = {
          method: 'GET',
          url: `/api/organizations/${linkedOrganization.id}/target-profiles`,
          headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
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
