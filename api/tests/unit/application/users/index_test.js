const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const securityController = require('../../../../lib/interfaces/controllers/security-controller');
const userController = require('../../../../lib/application/users/user-controller');
const userVerification = require('../../../../lib/application/preHandlers/user-existence-verification');

let server;

function startServer() {
  server = Hapi.server();
  return server.register(require('../../../../lib/application/users'));
}

describe('Unit | Router | user-router', () => {

  describe('GET /api/users', () => {

    beforeEach(() => {
      sinon.stub(securityController, 'checkUserIsAuthenticated').callsFake((request, h) => {
        h.continue({ credentials: { accessToken: 'jwt.access.token' } });
      });
      sinon.stub(securityController, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response(true));
      sinon.stub(userController, 'find').returns('ok');
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
      sinon.stub(userController, 'save').returns('ok');
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
      sinon.stub(userController, 'getUser').returns('ok');
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

  describe('GET /api/users/{id}/memberships', function() {
    beforeEach(() => {
      sinon.stub(userController, 'getMemberships').returns('ok');
      sinon.stub(securityController, 'checkRequestedUserIsAuthenticatedUser').callsFake((request, h) => h.response(true));
      startServer();
    });

    it('should exist', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/users/12/memberships',
      };

      // when
      return server.inject(options).then(() => {
        // then
        sinon.assert.calledOnce(userController.getMemberships);
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
      sinon.stub(userController, 'updateUser').returns('ok');
      sinon.stub(userVerification, 'verifyById').returns('ok');
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

      describe('pix-certif-terms-of-service-accepted validation', () => {

        it('should return 200 when pix-certif-terms-of-service-accepted field is a boolean', () => {
          // given
          const payloadAttributes = {
            'pix-certif-terms-of-service-accepted': true
          };

          // when
          return server.inject(request(payloadAttributes)).then((res) => {
            // then
            expect(res.statusCode).to.equal(200);
          });
        });

        it('should return 400 when pix-certif-terms-of-service-accepted field is not a boolean', () => {
          // given
          const payloadAttributes = {
            'pix-certif-terms-of-service-accepted': 'yolo'
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

  describe('GET /api/users/{id}/pixscore', function() {
    beforeEach(() => {
      sinon.stub(userController, 'getPixScore').returns('ok');
      sinon.stub(securityController, 'checkRequestedUserIsAuthenticatedUser').callsFake((request, h) => h.response(true));
      startServer();
    });

    it('should exist', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/users/42/pixscore',
      };

      // when
      return server.inject(options).then(() => {
        // then
        sinon.assert.calledOnce(userController.getPixScore);
      });
    });
  });

  describe('GET /api/users/{id}/scorecards', function() {
    beforeEach(() => {
      sinon.stub(userController, 'getScorecards').returns('ok');
      sinon.stub(securityController, 'checkRequestedUserIsAuthenticatedUser').callsFake((request, h) => h.response(true));
      startServer();
    });

    it('should exist', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/users/42/scorecards',
      };

      // when
      return server.inject(options).then(() => {
        // then
        sinon.assert.calledOnce(userController.getScorecards);
      });
    });
  });
});
