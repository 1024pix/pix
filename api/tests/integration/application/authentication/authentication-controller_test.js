const { knex, expect, hFake } = require('../../../test-helper');

const faker = require('faker');
const _ = require('lodash');

const authenticationController = require('../../../../lib/application/authentication/authentication-controller');
const encrypt = require('../../../../lib/domain/services/encryption-service');

describe('Integration | Controller | authentication-controller', () => {
  const userPassword = 'A124B2C3#!';
  const userEmail = 'emailWithSomeCamelCase@example.net';
  const userEmailSavedInDb = _.toLower(userEmail);

  beforeEach(() => {
    return encrypt.hashPassword(userPassword)
      .then((encryptedPassword) => knex('users').insert({
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: userEmailSavedInDb,
        password: encryptedPassword,
        cgu: true
      })
      );
  });

  afterEach(() => {
    return knex('users').delete();
  });

  describe('#save', () => {

    function _buildRequest(email, password) {
      return {
        payload: {
          data: {
            attributes: {
              email, password
            }
          }
        }
      };
    }

    it('should return an 201 when account exists', async () => {
      // given
      const request = _buildRequest(userEmail, userPassword);

      // when
      const response = await authenticationController.save(request, hFake);

      // then
      expect(response.statusCode).to.equal(201);
    });

    it('should return an error 400 with error message when account does not exist', async () => {
      // given
      const badEmail = 'email-that-does-not-exist@example.net';
      const request = _buildRequest(badEmail, userPassword);

      // when
      const response = await authenticationController.save(request, hFake);

      // then
      expect(response.statusCode).to.equal(400);
      expect(response.source).to.deep.equal({
        errors: [{
          'status': '400',
          'title': 'Invalid Payload',
          'detail': 'L\'adresse e-mail et/ou le mot de passe saisi(s) sont incorrects.',
          'source': {
            'pointer': '/data/attributes'
          }
        }]
      });
    });

    it('should return an 400 error when account exists but wrong password', async () => {
      // given
      const badPassword = 'BZU#!1344B2C3';
      const request = _buildRequest(userEmail, badPassword);

      // when
      const response = await authenticationController.save(request, hFake);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });
});
