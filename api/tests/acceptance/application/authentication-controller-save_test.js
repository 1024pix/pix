const {describe, it, beforeEach, before, after, knex, expect} = require('../../test-helper');

const faker = require('faker');
const jsonwebtoken = require('jsonwebtoken');
const settings = require('./../../../../api/lib/settings');

const server = require('../../../server');
const User = require('../../../lib/domain/models/data/user');

describe('Acceptance | Controller | authentication-controller', () => {

  let options;
  let attributes;

  let user;
  const userPassword = 'A124B2C3#!';

  before(() => {
    return new User({
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email(),
      password: userPassword,
      cgu: true
    }).save().then((createdUser) => {
      user = createdUser;
    });
  });

  beforeEach(() => {
    attributes = {
      email: user.get('email'),
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
        user_id: user.get('id'),
        email: user.get('email')
      }, settings.authentication.secret, { expiresIn: settings.authentication.tokenLifespan });

      expect(response.statusCode).to.equal(201);
      expect(response.result).to.deep.equal({
        data: {
          id: user.get('id'),
          type: 'authentication',
          attributes: {
            'user-id': user.get('id'),
            token: expectedToken,
            password: ''
          }
        }
      });
    });
  });

});
