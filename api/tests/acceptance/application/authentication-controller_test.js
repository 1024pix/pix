const { knex, expect, generateValidRequestAuhorizationHeader } = require('../../test-helper');

const faker = require('faker');
const _ = require('lodash');
const querystring = require('querystring');

const jsonwebtoken = require('jsonwebtoken');
const settings = require('./../../../lib/settings');
const encrypt = require('../../../lib/domain/services/encryption-service');

const server = require('../../../server');

describe('Acceptance | Controller | authentication-controller', () => {

  let userId;
  const userEmail = 'emailWithSomeCamelCase@example.net';
  const userEmailSavedInDb = _.toLower(userEmail);
  const userPassword = 'A124B2C3#!';

  beforeEach(() => {
    return encrypt.hashPassword(userPassword)
      .then((encryptedPassword) => {
        return {
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName(),
          email: userEmailSavedInDb,
          password: encryptedPassword,
          cgu: true
        };
      })
      .then((user) => knex('users').insert(user).returning('id'))
      .then(([id]) => userId = id);
  });

  afterEach(() => {
    return knex('organizations-accesses').delete()
      .then(() => knex('organization-roles').delete())
      .then(() => knex('organizations').delete())
      .then(() => knex('users').delete());
  });

  describe('POST /api/authentications', () => {

    const options = {
      method: 'POST',
      url: '/api/authentications',
      payload: {
        data: {
          type: 'user',
          attributes: {
            email: userEmail,
            password: userPassword,
          },
          relationships: {}
        }
      },
      headers: { authorization: generateValidRequestAuhorizationHeader(userId) },
    };

    it('should return 201 HTTP status code', () => {
      // given
      const expectedToken = jsonwebtoken.sign({
        user_id: userId
      }, settings.authentication.secret, { expiresIn: settings.authentication.tokenLifespan });

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(201);
        expect(response.result).to.deep.equal({
          data: {
            id: userId,
            type: 'authentications',
            attributes: {
              'user-id': userId.toString(),
              token: expectedToken,
              password: ''
            }
          }
        });
      });
    });

    it('should return 201 HTTP status code when missing authorization header', () => {
      // given
      options.headers = {};

      // when
      const promise = server.inject(options);

      // given
      return promise.then((response) => {
        expect(response.statusCode).to.equal(201);
      });
    });
  });

  describe('POST /api/token', () => {

    beforeEach(() => {
      const organization = {
        email: userEmail,
        type: 'PRO',
        name: 'Mon Entreprise',
        code: 'ABCD12'
      };
      const organizationRole = {
        name: 'ADMIN'
      };

      return Promise.all([
        knex('organizations').insert(organization).returning('id'),
        knex('organization-roles').insert(organizationRole).returning('id'),
      ])
        .then(([[organizationId], [organizationRoleId]]) => {
          return {
            userId,
            organizationId,
            organizationRoleId,
          };
        })
        .then((organizationAccess) => knex('organizations-accesses').insert(organizationAccess));
    });

    afterEach(() => {
      return knex('organizations-accesses').delete()
        .then(() => knex('organization-roles').delete())
        .then(() => knex('organizations').delete())
        .then(() => knex('users').delete());
    });

    it('should return an 200 with accessToken when authentication is ok', () => {
      // given
      const options = {
        method: 'POST',
        url: '/api/token',
        headers: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        payload: querystring.stringify({
          grant_type: 'password',
          username: userEmailSavedInDb,
          password: userPassword,
          scope: 'pix-orga'
        })
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);

        const result = response.result;
        expect(result.token_type).to.equal('bearer');
        expect(result.expires_in).to.equal(3600);
        expect(result.access_token).to.exist;
        expect(result.user_id).to.equal(userId);
      });
    });

  });

})
;
