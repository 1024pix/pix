const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const securityController = require('../../../../lib/interfaces/controllers/security-controller');
const userController = require('../../../../lib/application/users/user-controller');
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

  describe('GET /api/users', () => {

    beforeEach(() => {
      sandbox.stub(securityController, 'checkUserIsAuthenticated').callsFake((request, reply) => {
        reply.continue({ credentials: { accessToken: 'jwt.access.token' } });
      });
      sandbox.stub(securityController, 'checkUserHasRolePixMaster').callsFake((request, reply) => reply(true));
      sandbox.stub(userController, 'find').callsFake((request, reply) => reply('ok'));
      startServer();
    });

    it('should exist', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/users?firstName=Bruce&lastName=Wayne&email=batman@gotham.city&page=3&pageSize=25',
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
      });
    });
  });

  describe('POST /api/users', () => {

    beforeEach(() => {
      sandbox.stub(userController, 'save').callsFake((request, reply) => reply('ok'));
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
      sandbox.stub(userController, 'getUser').callsFake((request, reply) => reply('ok'));
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
      sandbox.stub(userController, 'getAuthenticatedUserProfile').callsFake((request, reply) => reply('ok'));
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
      sandbox.stub(userController, 'getProfileToCertify').callsFake((request, reply) => reply('ok'));
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
        sinon.assert.calledOnce(userController.getProfileToCertify);
        sinon.assert.callOrder(userVerification.verifyById, userController.getProfileToCertify);
      });
    });
  });

  describe('GET /api/users/{id}/organization-accesses', function() {
    beforeEach(() => {
      sandbox.stub(userController, 'getOrganizationAccesses').callsFake((request, reply) => reply('ok'));
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
        sinon.assert.calledOnce(userController.getOrganizationAccesses);
      });
    });
  });

  describe('PATCH /api/users/{id}', function() {

    const userId = '12344';
    const request = (payloadAttributes) => ({
      method: 'PATCH',
      url: `/api/users/${userId}`,
      payload: { data: { attributes: payloadAttributes } },
    });

    beforeEach(() => {
      sandbox.stub(userController, 'updateUser').callsFake((request, reply) => reply('ok'));
      sandbox.stub(userVerification, 'verifyById').callsFake((request, reply) => reply('ok'));
      startServer();
    });

    it('should exist and pass through user verification pre-handler', () => {
      // given
      return server.inject(request({})).then((res) => {
        // then
        expect(res.statusCode).to.equal(200);
        sinon.assert.calledOnce(userVerification.verifyById);
      });
    });

    describe('Payload schema validation', () => {

      it('should have a payload', () => {
        // given
        const requestWithoutPayload = {
          method: 'PATCH',
          url: `/api/users/${userId}`,
        };

        // then
        return server.inject(requestWithoutPayload).then((res) => {
          expect(res.statusCode).to.equal(400);
        });
      });

      describe('pix-orga-terms-of-service-accepted validation', () => {

        it('should return 200 when pix-orga-terms-of-service-accepted field is a boolean', () => {
          // given
          const payloadAttributes = {
            'pix-orga-terms-of-service-accepted': true
          };

          // when
          return server.inject(request(payloadAttributes)).then((res) => {
            // then
            expect(res.statusCode).to.equal(200);
          });
        });

        it('should return 400 when pix-orga-terms-of-service-accepted field is not a boolean', () => {
          // given
          const payloadAttributes = {
            'pix-orga-terms-of-service-accepted': 'yolo'
          };

          // when
          return server.inject(request(payloadAttributes)).then((res) => {
            // then
            expect(res.statusCode).to.equal(400);
          });
        });
      });

      describe('password validation', () => {

        it('should have a valid password format in payload', () => {
          // given
          const payloadAttributes = {
            'password': 'Mot de passe mal formé'
          };

          // when
          return server.inject(request(payloadAttributes)).then((res) => {
            // then
            expect(res.statusCode).to.equal(400);
          });
        });
      });
    });
  });
});
