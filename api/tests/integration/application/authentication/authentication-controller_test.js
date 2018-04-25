const { knex, sinon, expect } = require('../../../test-helper');

const faker = require('faker');
const _ = require('lodash');

const authenticationController = require('../../../../lib/application/authentication/authentication-controller');
const encrypt = require('../../../../lib/domain/services/encryption-service');

describe('Integration | Controller | authentication-controller', () => {

  let userId;
  const userPassword = 'A124B2C3#!';
  const userEmail = 'emailWithSomeCamelCase@example.net';
  const userEmailSavedInDb = _.toLower(userEmail);
  let replyStub;
  let codeStub;

  beforeEach(() => {
    codeStub = sinon.stub();
    replyStub = sinon.stub().returns({
      code: codeStub
    });

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

    it('should return an 201 when account exists', () => {
      // given
      const request = _buildRequest(userEmail, userPassword);

      // when
      const promise = authenticationController.save(request, replyStub);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(replyStub);
        sinon.assert.calledOnce(codeStub);
        sinon.assert.calledWith(codeStub, 201);
      });
    });

    it('should return an error 400 with error message when account does not exist', () => {
      // given
      const badEmail = 'email-that-does-not-exist@example.net';
      const request = _buildRequest(badEmail, userPassword);

      // when
      const promise = authenticationController.save(request, replyStub);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(replyStub);
        sinon.assert.calledWith(codeStub, 400);
        expect(replyStub.getCall(0).args).to.deep.equal([{
          errors: [{
            'status': '400',
            'title': 'Invalid Payload',
            'detail': 'L\'adresse e-mail et/ou le mot de passe saisi(s) sont incorrects.',
            'source': {
              'pointer': '/data/attributes'
            }
          }]
        }]);
      });
    });

    it('should return an 400 error when account exists but wrong password', () => {
      // given
      const badPassword = 'BZU#!1344B2C3';
      const request = _buildRequest(userEmail, badPassword);

      // when
      const promise = authenticationController.save(request, replyStub);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(replyStub);
        sinon.assert.calledOnce(codeStub);
        sinon.assert.calledWith(codeStub, 400);
      });
    });
  });
});
