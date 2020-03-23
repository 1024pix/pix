const { expect, databaseBuilder, generateValidRequestAuthorizationHeader } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Controller | users-controller-get-certification-center-memberships', () => {

  let user;
  let certificationCenter;
  let certificationCenterMembership;
  let options;

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('GET /users/:id/certification-center-memberships', () => {

    beforeEach(() => {
      certificationCenter = databaseBuilder.factory.buildCertificationCenter({ name: 'certifCenter' });
      user = databaseBuilder.factory.buildUser();
      certificationCenterMembership = databaseBuilder.factory.buildCertificationCenterMembership({ certificationCenterId: certificationCenter.id, userId: user.id });
      options = {
        method: 'GET',
        url: `/api/users/${user.id}/certification-center-memberships`,
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

      it('should return found accesses with 200 HTTP status code', async () => {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal({
          data: [
            {
              type: 'certificationCenterMemberships',
              id: certificationCenterMembership.id.toString(),
              attributes: {},
              relationships: {
                'certification-center': {
                  data:
                    { type: 'certificationCenters', id: certificationCenter.id.toString() },
                },
              },
            },
          ],
          included: [
            {
              type: 'certificationCenters',
              id: certificationCenter.id.toString(),
              attributes: {
                name: certificationCenter.name,
                type: certificationCenter.type,
              },
              relationships: {
                sessions: {
                  links: {
                    related: `/api/certification-centers/${certificationCenter.id.toString()}/sessions`
                  }
                }
              }
            },
          ],
        });
      });
    });
  });
});
