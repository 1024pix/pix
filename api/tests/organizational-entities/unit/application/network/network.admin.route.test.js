import sinon from 'sinon';

import { networkAdminController } from '../../../../../src/organizational-entities/application/network/network.admin.controller.js';
import { networkAdminRoute as moduleUnderTest } from '../../../../../src/organizational-entities/application/network/network.admin.route.js';
import { usecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect } from '../../../../test-helper.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Unit | Application | Admin | Route | Network', function () {
  describe('GET /api/admin/networks', function () {
    describe('when the user authenticated has no role', function () {
      it('should return 403 HTTP status code', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
          .returns((request, h) => h.response().code(403).takeover());
        sinon.stub(networkAdminController, 'findAllFilteredNetworks').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('GET', '/api/admin/networks', {});

        // then
        expect(response.statusCode).to.equal(403);
        sinon.assert.notCalled(networkAdminController.findAllFilteredNetworks);
      });
    });

    it('should restrict access with the four admin roles for reading', async function () {
      // given
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(networkAdminController, 'findAllFilteredNetworks').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      await httpTestServer.request('GET', '/api/admin/networks', {});

      // then
      sinon.assert.calledWithExactly(securityPreHandlers.hasAtLeastOneAccessOf, [
        securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
        securityPreHandlers.checkAdminMemberHasRoleMetier,
        securityPreHandlers.checkAdminMemberHasRoleCertif,
        securityPreHandlers.checkAdminMemberHasRoleSupport,
      ]);
    });
  });

  describe('GET /api/admin/networks/{networkId}', function () {
    describe('when the authenticated user has super admin role', function () {
      it('should call getNetworkById controller method', async function () {
        // given
        sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
        sinon.stub(usecases, 'getNetworkDetails').returns('ok');
        sinon.stub(networkAdminController, 'getNetworkDetails').returns('ok');

        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        await httpTestServer.request('GET', '/api/admin/networks/1', {});

        // then
        sinon.assert.called(networkAdminController.getNetworkDetails);
      });
    });

    describe('when the user authenticated has no role', function () {
      it('should return 403 HTTP status code', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
          .returns((request, h) => h.response().code(403).takeover());
        sinon.stub(networkAdminController, 'getNetworkDetails').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('GET', '/api/admin/networks/1', {});

        // then
        expect(response.statusCode).to.equal(403);
        sinon.assert.notCalled(networkAdminController.getNetworkDetails);
      });
    });

    it('should restrict access with the four admin roles for reading', async function () {
      // given
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(networkAdminController, 'getNetworkDetails').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      await httpTestServer.request('GET', '/api/admin/networks/1', {});

      // then
      sinon.assert.calledWithExactly(securityPreHandlers.hasAtLeastOneAccessOf, [
        securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
        securityPreHandlers.checkAdminMemberHasRoleMetier,
        securityPreHandlers.checkAdminMemberHasRoleCertif,
        securityPreHandlers.checkAdminMemberHasRoleSupport,
      ]);
    });
  });

  describe('PATCH /api/admin/networks/{networkId}', function () {
    describe('when the authenticated user has super admin role', function () {
      it('should call update controller method', async function () {
        // given
        sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
        sinon.stub(usecases, 'updateNetwork').returns('ok');
        sinon.stub(networkAdminController, 'update').returns('ok');

        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        await httpTestServer.request('PATCH', '/api/admin/networks/1', {
          data: {
            attributes: { name: 'Nouveau nom' },
          },
        });

        // then
        sinon.assert.called(networkAdminController.update);
      });
    });

    describe('when the user authenticated has no role', function () {
      it('should return 403 HTTP status code', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
          .returns((request, h) => h.response().code(403).takeover());
        sinon.stub(networkAdminController, 'update').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('PATCH', '/api/admin/networks/1', {
          data: {
            attributes: { name: 'Nouveau nom' },
          },
        });

        // then
        expect(response.statusCode).to.equal(403);
        sinon.assert.notCalled(networkAdminController.update);
      });
    });
  });

  describe('POST /api/admin/networks', function () {
    describe('when the authenticated user has super admin role', function () {
      it('should call create controller method', async function () {
        // given
        sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
        sinon.stub(usecases, 'createNetwork').returns('ok');
        sinon.stub(networkAdminController, 'create').returns('ok');

        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        await httpTestServer.request('POST', '/api/admin/networks', {
          data: {
            attributes: {
              'organization-id': 123,
              name: 'Some network name',
            },
          },
        });

        // then
        sinon.assert.called(networkAdminController.create);
      });
    });

    describe('when the user authenticated has no role', function () {
      it('should return 403 HTTP status code', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
          .returns((request, h) => h.response().code(403).takeover());
        sinon.stub(networkAdminController, 'create').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('POST', '/api/admin/networks', {
          data: {
            attributes: {
              'organization-id': 123,
              name: 'Some network name',
            },
          },
        });

        // then
        expect(response.statusCode).to.equal(403);
        sinon.assert.notCalled(networkAdminController.create);
      });
    });
  });
});
