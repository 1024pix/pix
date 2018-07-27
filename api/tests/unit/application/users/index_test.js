const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const UserController = require('../../../../lib/application/users/user-controller');
const userVerification = require('../../../../lib/application/preHandlers/user-existence-verification');

const sandbox = sinon.createSandbox();

let server;

function startServer() {
  server = new Hapi.Server();
  server.connection({ port: null });
  server.register({ register: require('../../../../lib/application/users') });
}

describe('Unit | Router | user-router', () => {

  afterEach(() => {
    sandbox.restore();
  });

  describe('POST /api/users', () => {

    beforeEach(() => {
      sandbox.stub(UserController, 'save').callsFake((request, reply) => reply('ok'));
      startServer();
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
              password: 'password_1234',
            },
          },
        },
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
      });
    });
  });

  describe('GET /api/users/{id}', function() {

    beforeEach(() => {
      sandbox.stub(UserController, 'getUser').callsFake((request, reply) => reply('ok'));
      startServer();
    });

    it('should exist', () => {
      // given
      const options = { method: 'GET', url: '/api/users/1234' };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
      });
    });
  });

  describe('GET /api/users/me', function() {

    beforeEach(() => {
      sandbox.stub(UserController, 'getAuthenticatedUserProfile').callsFake((request, reply) => reply('ok'));
      startServer();
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

  describe('GET /api/users/{id}/skills', function() {
    beforeEach(() => {
      sandbox.stub(UserController, 'getProfileToCertify').callsFake((request, reply) => reply('ok'));
      sandbox.stub(userVerification, 'verifyById').callsFake((request, reply) => reply('ok'));
      startServer();
    });

    it('should exist', () => {
      const options = {
        method: 'GET',
        url: '/api/users/12/skills',
      };

      // given
      return server.inject(options).then((_) => {
        sinon.assert.calledOnce(userVerification.verifyById);
        sinon.assert.calledOnce(UserController.getProfileToCertify);
        sinon.assert.callOrder(userVerification.verifyById, UserController.getProfileToCertify);
      });
    });
  });

  describe('GET /api/users/{id}/organization-accesses', function() {
    beforeEach(() => {
      sandbox.stub(UserController, 'getOrganizationAccesses').callsFake((request, reply) => reply('ok'));
      startServer();
    });

    it('should exist', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/users/12/organization-accesses',
      };

      // when
      return server.inject(options).then(() => {
        // then
        sinon.assert.calledOnce(UserController.getOrganizationAccesses);
      });
    });
  });

  describe('PATCH /api/users/{id}', function() {

    const userId = '12344';
    const wellFormedOptions = () => ({
      method: 'PATCH',
      url: `/api/users/${userId}`,
      payload: { data: { attributes: { password: '12345678ab+!' } } },
    });

    beforeEach(() => {
      sandbox.stub(UserController, 'updatePassword').callsFake((request, reply) => reply('ok'));
      sandbox.stub(userVerification, 'verifyById').callsFake((request, reply) => reply('ok'));
      startServer();
    });

    it('should exist and pass through user verification pre-handler', () => {
      // given
      return server.inject(wellFormedOptions()).then((res) => {
        // then
        expect(res.statusCode).to.equal(200);
        sinon.assert.calledOnce(userVerification.verifyById);
      });
    });

    describe('Payload schema validation (password attribute in payload)', () => {

      it('should have a payload', () => {
        // given
        const options = wellFormedOptions();
        delete options.payload;

        // then
        return server.inject(options).then((res) => {
          expect(res.statusCode).to.equal(400);
        });
      });

      it('should have a valid password format in payload', () => {
        // given
        const options = wellFormedOptions();
        options.payload.data.attributes.password = 'Mot de passe mal formé';

        // then
        return server.inject(options).then((res) => {
          expect(res.statusCode).to.equal(400);
        });
      });
    });
  });
});
