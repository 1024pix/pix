const { knex, expect, generateValidRequestAuhorizationHeader } = require('../../test-helper');

const faker = require('faker');
const _ = require('lodash');

const jsonwebtoken = require('jsonwebtoken');
const settings = require('./../../../../api/lib/settings');

const server = require('../../../server');
const BookshelfUser = require('../../../lib/infrastructure/data/user');

describe('Acceptance | Controller | authentication-controller', () => {

  describe('POST /api/authentications', () => {

    let options;
    let attributes;

    let user;
    const userEmail = 'emailWithSomeCamelCase@example.net';
    const userEmailSavedInDb = _.toLower(userEmail);

    const userPassword = 'A124B2C3#!';

    before(() => {
      return new BookshelfUser({
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: userEmailSavedInDb,
        password: userPassword,
        cgu: true
      }).save().then((createdUser) => {
        user = createdUser.toDomainEntity();
      });
    });

    beforeEach(() => {
      attributes = {
        email: userEmail,
        password: userPassword
      };

      options = {
        method: 'POST',
        url: '/api/authentications',
        payload: {
          data: {
            type: 'user',
            attributes,
            relationships: {}
          }
        },
        headers: { authorization: generateValidRequestAuhorizationHeader(user.id) },
      };
    });

    after(() => {
      return knex('users').delete();
    });

    it('should return 201 HTTP status code', () => {
      // when
      const promise = server.inject(options);

      // then
      return promise.then(response => {

        const expectedToken = jsonwebtoken.sign({
          user_id: user.id
        }, settings.authentication.secret, { expiresIn: settings.authentication.tokenLifespan });

        const userId = user.id;
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

});
