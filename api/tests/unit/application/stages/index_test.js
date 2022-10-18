const { expect, HttpTestServer, sinon } = require('../../../test-helper');
const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const stagesController = require('../../../../lib/application/stages/stages-controller');
const moduleUnderTest = require('../../../../lib/application/stages');

describe('Unit | Application | Stages | Routes', function () {
  describe('POST /api/admin/stages', function () {
    context('when user has role "SUPER_ADMIN", "SUPPORT" or "METIER"', function () {
      it('should return a response with an HTTP status code 201', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkAdminMemberHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(() => (request, h) => h.response(true));
        sinon.stub(stagesController, 'create').callsFake((request, h) => h.response('ok').code(201));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode } = await httpTestServer.request('POST', '/api/admin/stages', {
          data: {
            attributes: {
              message: 'le message',
              'prescriber-description': null,
              'prescriber-title': null,
              threshold: 50,
              level: null,
              title: 'le titre',
            },
            relationships: {
              'target-profile': {
                data: {
                  id: 123,
                },
              },
            },
          },
        });

        // then
        expect(statusCode).to.equal(201);
      });
    });

    context('when user has role "CERTIF"', function () {
      it('should return a response with an HTTP status code 403', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkAdminMemberHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(
            () => (request, h) =>
              h
                .response({ errors: new Error('forbidden') })
                .code(403)
                .takeover()
          );
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode } = await httpTestServer.request('POST', '/api/admin/stages', {
          data: {
            attributes: {
              message: 'le message',
              'prescriber-description': null,
              'prescriber-title': null,
              threshold: 50,
              level: null,
              title: 'le titre',
            },
            relationships: {
              'target-profile': {
                data: {
                  id: 123,
                },
              },
            },
          },
        });

        // then
        expect(statusCode).to.equal(403);
      });
    });
  });

  describe('GET /api/admin/stages/:id', function () {
    it('should exist', async function () {
      // given
      sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(stagesController, 'getStageDetails').callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const method = 'GET';
      const url = '/api/admin/stages/34';

      // when
      const { statusCode } = await httpTestServer.request(method, url);

      // then
      expect(statusCode).to.equal(200);
    });

    it('should return a 400 error when the id is not a number', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const method = 'GET';
      const unknownId = 'abcd45';
      const url = `/api/admin/stages/${unknownId}`;

      // when
      const { statusCode } = await httpTestServer.request(method, url);

      // then
      expect(statusCode).to.equal(400);
    });
  });

  describe('PATCH /api/admin/stages/{id}', function () {
    context('when user has role "SUPER_ADMIN", "SUPPORT" or "METIER"', function () {
      it('should return a response with an HTTP status code 201', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkAdminMemberHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(() => (request, h) => h.response(true));
        sinon.stub(stagesController, 'updateStage').callsFake((request, h) => h.response('ok').code(201));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode } = await httpTestServer.request('PATCH', '/api/admin/stages/1', {
          data: {
            attributes: {
              message: null,
              'prescriber-description': null,
              'prescriber-title': null,
              threshold: null,
              level: null,
              title: null,
            },
          },
        });

        // then
        expect(statusCode).to.equal(201);
      });

      it('should update the stage with attributes', async function () {
        // given
        sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
        sinon.stub(stagesController, 'updateStage').callsFake((request, h) => h.response('ok').code(204));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const method = 'PATCH';
        const payload = {
          data: {
            attributes: {
              threshold: 42,
              level: null,
              title: 'titre',
              message: 'message',
              'prescriber-title': 'test',
              'prescriber-description': 'bidule',
            },
          },
        };
        const url = '/api/admin/stages/34';

        // when
        const { statusCode } = await httpTestServer.request(method, url, payload);

        // then
        expect(statusCode).to.equal(204);
      });

      it('should update the stage even if there is null', async function () {
        // given
        sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
        sinon.stub(stagesController, 'updateStage').callsFake((request, h) => h.response('ok').code(204));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const method = 'PATCH';
        const payload = {
          data: {
            attributes: {
              threshold: 42,
              level: null,
              title: 'titre',
              message: null,
              'prescriber-title': null,
              'prescriber-description': 'bidule',
            },
          },
        };
        const url = '/api/admin/stages/34';

        // when
        const { statusCode } = await httpTestServer.request(method, url, payload);

        // then
        expect(statusCode).to.equal(204);
      });

      context('when the id is not a number', function () {
        it('should return a 400 error', async function () {
          // given
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          const method = 'PATCH';
          const unknownId = 'abcd45';
          const payload = {
            data: {
              attributes: {
                'prescriber-title': 'test',
                'prescriber-description': 'bidule',
              },
            },
          };
          const url = `/api/admin/stages/${unknownId}`;

          // when
          const { statusCode } = await httpTestServer.request(method, url, payload);

          // then
          expect(statusCode).to.equal(400);
        });
      });

      context('when payload is undefined', function () {
        it('should return a 400 error', async function () {
          // given
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          const method = 'PATCH';
          const payload = {
            data: {
              attributes: {
                'prescriber-title': undefined,
                'prescriber-description': undefined,
              },
            },
          };
          const url = '/api/admin/stages/34';

          // when
          const { statusCode } = await httpTestServer.request(method, url, payload);

          // then
          expect(statusCode).to.equal(400);
        });
      });

      context('when payload is empty strings', function () {
        it('should return a 400 error', async function () {
          // given
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          const method = 'PATCH';
          const payload = {
            data: {
              attributes: {
                'prescriber-title': '',
                'prescriber-description': '',
              },
            },
          };
          const url = '/api/admin/stages/34';

          // when
          const { statusCode } = await httpTestServer.request(method, url, payload);

          // then
          expect(statusCode).to.equal(400);
        });
      });
    });

    context('when user has role "CERTIF"', function () {
      it('should return a response with an HTTP status code 403', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkAdminMemberHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(
            () => (request, h) =>
              h
                .response({ errors: new Error('forbidden') })
                .code(403)
                .takeover()
          );
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode } = await httpTestServer.request('PATCH', '/api/admin/stages/1', {
          data: {
            attributes: {
              message: null,
              'prescriber-description': null,
              'prescriber-title': null,
              threshold: null,
              level: null,
              title: null,
            },
          },
        });

        // then
        expect(statusCode).to.equal(403);
      });
    });
  });
});
