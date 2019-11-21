const { expect, generateValidRequestAuthorizationHeader, databaseBuilder } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Controller | users-controller-accept-pix-orga-terms-of-service', () => {

  let server;
  let user;
  let options;

  beforeEach(async () => {
    server = await createServer();

    user = databaseBuilder.factory.buildUser({ pixOrgaTermsOfServiceAccepted: false });

    options = {
      method: 'PATCH',
      url: `/api/users/${user.id}/pix-orga-terms-of-service-acceptance`,
      headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
    };

    return databaseBuilder.commit();
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

    it('should respond with a 403 - forbidden access - if requested user is not the same as authenticated user', async () => {
      // given
      const otherUserId = 9999;
      options.headers.authorization = generateValidRequestAuthorizationHeader(otherUserId);

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('Success case', () => {

    it('should return the user with pixOrgaTermsOfServiceAccepted', async () => {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data.attributes['pix-orga-terms-of-service-accepted']).to.be.true;
    });
  });
});
