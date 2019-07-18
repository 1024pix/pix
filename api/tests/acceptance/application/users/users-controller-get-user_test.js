const { expect, knex, generateValidRequestAuhorizationHeader } = require('../../../test-helper');
const faker = require('faker');
const createServer = require('../../../../server');

describe('Acceptance | Controller | users-controller-get-user', () => {

  let options;
  let server;

  beforeEach(async () => {
    options = {
      method: 'GET',
      url: '/api/users/1234',
      payload: { },
      headers: { authorization: generateValidRequestAuhorizationHeader() },
    };
    server = await createServer();
  });

  describe('GET /users/:id', () => {

    const userToInsert = {
      id: 1234,
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email(),
      password: 'A124B2C3#!',
      cgu: true,
      pixOrgaTermsOfServiceAccepted: false,
      pixCertifTermsOfServiceAccepted: false
    };

    beforeEach(() => {
      return knex('users').insert(userToInsert);
    });

    afterEach(() => {
      return knex('users').delete();
    });

    it('should return found user with 200 HTTP status code', () => {
      // given
      const expectedUserJSONApi = {
        data: {
          type: 'users',
          id: '1234',
          attributes: {
            'first-name': userToInsert.firstName,
            'last-name': userToInsert.lastName,
            'email': userToInsert.email.toLowerCase(),
            'cgu': true,
            'is-profile-v2': false,
            'pix-orga-terms-of-service-accepted': false,
            'pix-certif-terms-of-service-accepted': false
          },
          relationships: {
            'memberships': {
              links: {
                related: '/api/users/1234/memberships'
              }
            },
            'certification-center-memberships': {
              links: {
                related: '/api/users/1234/certification-center-memberships'
              }
            },
            'pix-score' : {
              links: {
                related: '/api/users/1234/pixscore'
              }
            },
            scorecards: {
              links: {
                related: '/api/users/1234/scorecards'
              }
            },
            'campaign-participations': {
              links: {
                related: '/api/users/1234/campaign-participations'
              }
            },
            organizations: {
              data: []
            },
          }
        }
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal(expectedUserJSONApi);
      });
    });
  });

});
