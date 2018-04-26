const { knex, expect, generateValidRequestAuhorizationHeader } = require('../../test-helper');

const faker = require('faker');
const _ = require('lodash');

const jsonwebtoken = require('jsonwebtoken');
const settings = require('./../../../lib/settings');
const encrypt = require('../../../lib/domain/services/encryption-service');

const server = require('../../../server');

describe('Acceptance | Controller | authentication-controller', () => {

  describe('POST /api/authentications', () => {

    let options;
    let userId;
    const userEmail = 'emailWithSomeCamelCase@example.net';
    const userEmailSavedInDb = _.toLower(userEmail);
    const userPassword = 'A124B2C3#!';

    beforeEach(() => {
      return encrypt.hashPassword(userPassword)
        .then((encryptedPassword) => knex('users').insert({
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName(),
          email: userEmailSavedInDb,
          password: encryptedPassword,
          cgu: true
        })
        )
        .then((userIds) => userId = userIds[0])
        .then(() => {
          options = {
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
        });
    });

    afterEach(() => {
      return knex('users').delete();
    });

    it('should return 201 HTTP status code', () => {
      // given
      const expectedToken = jsonwebtoken.sign({
        user_id: userId
      }, settings.authentication.secret, { expiresIn: settings.authentication.tokenLifespan });

      // when
      const promise = server.inject(options);

      // then
      return promise.then(response => {
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

})
;
