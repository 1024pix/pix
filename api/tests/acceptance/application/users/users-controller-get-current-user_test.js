const { expect, generateValidRequestAuthorizationHeader, databaseBuilder } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Controller | users-controller-get-current-user', () => {

  let options;
  let server;
  let user;

  beforeEach(async () => {
    server = await createServer();

    user = databaseBuilder.factory.buildUser();

    options = {
      method: 'GET',
      url: '/api/users/me',
      payload: {},
      headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
    };

    return databaseBuilder.commit();
  });

  describe('GET /users/me', () => {

    it('should return found user with 200 HTTP status code', async () => {
      // given
      const expectedUserJSONApi = {
        data: {
          type: 'users',
          id: user.id.toString(),
          attributes: {
            'first-name': user.firstName,
            'last-name': user.lastName,
            email: user.email.toLowerCase(),
            cgu: true,
            'is-profile-v2': false,
            'pix-orga-terms-of-service-accepted': false,
            'pix-certif-terms-of-service-accepted': false,
            'has-seen-assessment-instructions': false,
            'uses-profile-v2': false,
          },
          relationships: {
            memberships: {
              links: {
                related: `/api/users/${user.id}/memberships`
              }
            },
            'certification-center-memberships': {
              links: {
                related: `/api/users/${user.id}/certification-center-memberships`
              }
            },
            'pix-score' : {
              links: {
                related: `/api/users/${user.id}/pixscore`
              }
            },
            scorecards: {
              links: {
                related: `/api/users/${user.id}/scorecards`
              }
            },
            'campaign-participations': {
              links: {
                related: `/api/users/${user.id}/campaign-participations`
              }
            },
            'certification-profile': {
              links: {
                related: `/api/users/${user.id}/certification-profile`,
              }
            }
          }
        }
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal(expectedUserJSONApi);
    });
  });

});
