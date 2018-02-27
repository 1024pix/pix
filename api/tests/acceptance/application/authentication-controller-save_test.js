const { knex, expect } = require('../../test-helper');

const faker = require('faker');
const _ = require('lodash');

const jsonwebtoken = require('jsonwebtoken');
const settings = require('./../../../../api/lib/settings');

const server = require('../../../server');
const BookshelfUser = require('../../../lib/infrastructure/data/user');

describe('Acceptance | Controller | authentication-controller', () => {

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
      user = createdUser;
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
      }
    };
  });

  after(() => {
    return knex('users').delete();
  });

  it('should return 201 HTTP status code', () => {
    return server.injectThen(options).then(response => {

      const expectedToken = jsonwebtoken.sign({
        user_id: user.get('id')
      }, settings.authentication.secret, { expiresIn: settings.authentication.tokenLifespan });

      const userId = user.get('id').toString();
      expect(response.statusCode).to.equal(201);
      expect(response.result).to.deep.equal({
        data: {
          id: userId,
          type: 'authentications',
          attributes: {
            'user-id': userId,
            token: expectedToken,
            password: ''
          }
        }
      });
    });
  });

});
