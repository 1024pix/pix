const { expect, databaseBuilder, generateValidRequestAuthorizationHeader } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Controller | users-controller-get-certification-center-memberships', () => {

  let user;
  let certificationCenter;
  let certificationCenterMembership;

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('GET /users/:id/certification-center-memberships', () => {
    let options;
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

    afterEach(() => {
      return databaseBuilder.clean();
    });

    it('should return found accesses with 200 HTTP status code', () => {
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
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
                name: 'certifCenter',
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
