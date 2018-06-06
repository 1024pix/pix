const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const UserController = require('../../../../lib/application/users/user-controller');
const userVerification = require('../../../../lib/application/preHandlers/user-existence-verification');

describe('Unit | Router | user-router', () => {

  let server;

  beforeEach(() => {
    server = new Hapi.Server();
    server.connection({ port: null });
    server.register({ register: require('../../../../lib/application/users') });
  });

  describe('POST /api/users', () => {

    before(() => {
      sinon.stub(UserController, 'save').callsFake((request, reply) => reply('ok'));
    });

    after(() => {
      UserController.save.restore();
    });

    it('should exist', () => {
      // given
      const options = {
        method: 'POST',
        url: '/api/users',
        payload: {
          data: {
            attributes: {
              'first-name': 'Edouard',
              'last-name': 'Doux',
              email: 'doux.doudou@example.net',
              password: 'password_1234'
            }
          }
        }
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
      });
    });

  });

  describe('GET /api/users/me', function() {

    before(() => {
      sinon.stub(UserController, 'getAuthenticatedUser').callsFake((request, reply) => reply('ok'));
    });

    after(() => {
      UserController.getAuthenticatedUser.restore();
    });

    it('should exist', () => {
      // given
      const options = { method: 'GET', url: '/api/users/me' };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
      });
    });
  });

  describe('GET /api/users/me/profile', function() {

    before(() => {
      sinon.stub(UserController, 'getAuthenticatedUserProfile').callsFake((request, reply) => reply('ok'));
    });

    after(() => {
      UserController.getAuthenticatedUserProfile.restore();
    });
    it('should exist', () => {
      // given
      const options = { method: 'GET', url: '/api/users/me/profile' };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
      });
    });
  });

  describe('GET /api/users/{id}/skills', function() {
    before(() => {
      sinon.stub(UserController, 'getProfileToCertify').callsFake((request, reply) => reply('ok'));
      sinon.stub(userVerification, 'verifyById').callsFake((request, reply) => reply('ok'));
    });

    after(() => {
      UserController.getProfileToCertify.restore();
      userVerification.verifyById.restore();
    });

    it('should exist', () => {
      const options = {
        method: 'GET',
        url: '/api/users/12/skills'
      };

      // given
      return server.inject(options).then(_ => {
        sinon.assert.calledOnce(userVerification.verifyById);
        sinon.assert.calledOnce(UserController.getProfileToCertify);
        sinon.assert.callOrder(userVerification.verifyById, UserController.getProfileToCertify);
      });
    });
  });

  describe('PATCH /api/users/{id}', function() {

    const userId = '12344';
    const options = { method: 'PATCH', url: `/api/users/${userId}` };

    before(() => {
      sinon.stub(UserController, 'updatePassword').callsFake((request, reply) => reply('ok'));
      sinon.stub(userVerification, 'verifyById').callsFake((request, reply) => reply('ok'));
    });

    after(() => {
      UserController.updatePassword.restore();
      userVerification.verifyById.restore();
    });

    it('should exist', () => {
      const wellFormedOptions = {
        method: 'PATCH',
        url: `/api/users/${userId}`,
        payload: { data: { attributes: { password: '12345678ab+!' } } }
      };

      // given
      return server.inject(wellFormedOptions).then((res) => {
        expect(res.statusCode).to.equal(200);
      });
    });

    describe('Payload schema validation (password attribute in payload)', () => {

      it('should have a payload', () => {
        // then
        return server.inject(options)
          .then((res) => {
            expect(res.statusCode).to.equal(400);
          });
      });

      it('should have a valid password format in payload', () => {
        // given
        options['payload'] = {
          data: {
            attributes: {
              password: 'Mot de passe'
            }
          }
        };
        // then
        return server.inject(options).then((res) => {
          expect(res.statusCode).to.equal(400);
        });
      });

      it('should passing thought user verification pre-handler', () => {
        // given
        options['payload'] = {
          data: {
            attributes: {
              password: 'Mot de passe'
            }
          }
        };
        // then
        return server.inject(options).then(() => {
          sinon.assert.calledOnce(userVerification.verifyById);
        });
      });

    });

  });

});
