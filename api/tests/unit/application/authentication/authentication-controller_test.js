const { knex, sinon, expect } = require('../../../test-helper');

const faker = require('faker');
const server = require('../../../../server');

const authenticationController = require('../../../../lib/application/authentication/authentication-controller');
const User = require('../../../../lib/infrastructure/data/user');

describe('Unit | Controller | authentication-controller', () => {

  const password = 'A124B2C3#!';
  let replyStub;
  let codeStub;
  let user;

  before(() => {
    return new User({
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email(),
      password,
      cgu: true
    }).save().then((createdUser) => {
      user = createdUser;
    });
  });

  after(() => {
    return knex('users').delete();
  });

  beforeEach(() => {
    codeStub = sinon.stub();
    replyStub = sinon.stub().returns({
      code: codeStub
    });
  });

  after((done) => {
    server.stop(done);
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

    it('should return an 400 error when account does not exist', () => {
      // Given
      const email = 'email-that-does-not-exist@example.net';
      const request = _buildRequest(email, password);

      // When
      const promise = authenticationController.save(request, replyStub);

      // Then
      return promise.then(() => {
        sinon.assert.calledOnce(replyStub);
        sinon.assert.calledWith(codeStub, 400);
      });
    });

    it('should return an error message', () => {
      // Given
      const email = 'email-that-does-not-exist@example.net';
      const request = _buildRequest(email, password);

      // When
      const promise = authenticationController.save(request, replyStub);

      // Then
      return promise.then(() => {
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

    it('should return an 201 when account exists', () => {
      // Given
      const password = 'A124B2C3#!';
      const request = _buildRequest(user.get('email'), password);

      // When
      const promise = authenticationController.save(request, replyStub);

      // Then
      return promise.then(() => {
        sinon.assert.calledOnce(replyStub);
        sinon.assert.calledOnce(codeStub);
        sinon.assert.calledWith(codeStub, 201);
      });
    });

    it('should return an 400 error when account exists but wrong password', () => {
      // Given
      const password = 'BZU#!1344B2C3';
      const request = _buildRequest(user.get('email'), password);

      // When
      const promise = authenticationController.save(request, replyStub);

      // Then
      return promise.then(() => {
        sinon.assert.calledOnce(replyStub);
        sinon.assert.calledOnce(codeStub);
        sinon.assert.calledWith(codeStub, 400);
      });
    });
  });
});
