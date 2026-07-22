import sinon from 'sinon';

import { combinedCourseBlueprintController } from '../../../../src/quest/application/combined-course-blueprint-controller.js';
import { combinedCourseBlueprintRoute } from '../../../../src/quest/application/combined-course-blueprint-route.js';
import questSecurityPreHandlers from '../../../../src/quest/application/security-pre-handlers.js';
import { REWARD_TYPES } from '../../../../src/quest/domain/constants.js';
import { securityPreHandlers } from '../../../../src/shared/application/security-pre-handlers.js';
import { expect } from '../../../test-helper.js';
import { HttpTestServer } from '../../../tooling/server/http-test-server.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../tooling/test-utils/http-server.js';

describe('Quest | Unit | Routes | combined-course-blueprint-route', function () {
  describe('GET /api/admin/combined-course-blueprints', function () {
    it('should call prehandler', async function () {
      // given
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(combinedCourseBlueprintController, 'findAll').callsFake((_, h) => h.response());

      const httpTestServer = new HttpTestServer();
      httpTestServer.setupAuthentication();
      await httpTestServer.register(combinedCourseBlueprintRoute);

      // when
      await httpTestServer.request(
        'GET',
        '/api/admin/combined-course-blueprints',
        null,
        null,
        generateAuthenticatedUserRequestHeaders({ userId: 123 }),
      );

      // then
      expect(securityPreHandlers.hasAtLeastOneAccessOf).to.have.been.calledWithExactly([
        securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
        securityPreHandlers.checkAdminMemberHasRoleMetier,
      ]);
    });
  });

  describe('POST /api/admin/combined-course-blueprints', function () {
    it('should call prehandler', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').callsFake((request, h) => h.response(true));
      sinon.stub(combinedCourseBlueprintController, 'save').callsFake((_, h) => h.response());

      const payload = {
        data: {
          type: 'combined-course-blueprints',
          attributes: {
            name: 'Mon parcours combiné',
            'internal-name': 'Mon schéma de parcours combiné',
            description: 'La description combinix',
            illustration: 'illustration.svg',
            'reward-id': 1,
            'reward-type': REWARD_TYPES.ATTESTATION,
            'reward-requirements': 'Description of the reward requirements',
            content: [{ type: 'module', value: 'e67ec5d0', shortId: 'short-e67ec5d0' }],
            'capped-tube-requirements': [{ threshold: 20, tubes: [{ tubeId: 'tube1', level: 5 }] }],
          },
        },
      };

      const httpTestServer = new HttpTestServer();
      httpTestServer.setupAuthentication();
      await httpTestServer.register(combinedCourseBlueprintRoute);

      // when
      await httpTestServer.request(
        'POST',
        '/api/admin/combined-course-blueprints',
        payload,
        null,
        generateAuthenticatedUserRequestHeaders({ userId: 123 }),
      );

      // then
      expect(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin).to.have.been.called;
    });
  });

  describe('GET /api/admin/combined-course-blueprints/{blueprintId}', function () {
    it('should call prehandler', async function () {
      // given
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(combinedCourseBlueprintController, 'getById').callsFake((_, h) => h.response());

      const httpTestServer = new HttpTestServer();
      httpTestServer.setupAuthentication();
      await httpTestServer.register(combinedCourseBlueprintRoute);

      // when
      await httpTestServer.request(
        'GET',
        '/api/admin/combined-course-blueprints/123',
        null,
        null,
        generateAuthenticatedUserRequestHeaders({ userId: 123 }),
      );

      // then
      expect(securityPreHandlers.hasAtLeastOneAccessOf).to.have.been.calledWithExactly([
        securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
        securityPreHandlers.checkAdminMemberHasRoleMetier,
      ]);
    });
  });

  describe('DELETE /api/admin/combined-course-blueprints/{blueprintId}/organizations/{organizationId}', function () {
    it('should call prehandler', async function () {
      // given
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(combinedCourseBlueprintController, 'detachOrganization').callsFake((_, h) => h.response());

      const httpTestServer = new HttpTestServer();
      httpTestServer.setupAuthentication();
      await httpTestServer.register(combinedCourseBlueprintRoute);

      // when
      await httpTestServer.request(
        'DELETE',
        '/api/admin/combined-course-blueprints/123/organizations/456',
        null,
        null,
        generateAuthenticatedUserRequestHeaders({ userId: 123 }),
      );

      // then
      expect(securityPreHandlers.hasAtLeastOneAccessOf).to.have.been.calledWithExactly([
        securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
        securityPreHandlers.checkAdminMemberHasRoleMetier,
      ]);
    });
  });

  describe('POST /api/admin/combined-course-blueprints/{blueprintId}/organizations', function () {
    it('should call prehandler', async function () {
      // given
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(combinedCourseBlueprintController, 'attachOrganizations').callsFake((_, h) => h.response());

      const payload = { 'organization-ids': [456] };

      const httpTestServer = new HttpTestServer();
      httpTestServer.setupAuthentication();
      await httpTestServer.register(combinedCourseBlueprintRoute);

      // when
      await httpTestServer.request(
        'POST',
        '/api/admin/combined-course-blueprints/123/organizations',
        payload,
        null,
        generateAuthenticatedUserRequestHeaders({ userId: 123 }),
      );

      // then
      expect(securityPreHandlers.hasAtLeastOneAccessOf).to.have.been.calledWithExactly([
        securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
        securityPreHandlers.checkAdminMemberHasRoleMetier,
      ]);
    });
  });

  describe('GET /api/organizations/{organizationId}/combined-course-blueprints', function () {
    it('should call prehandler', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkOrganizationAccess').returns(() => true);
      sinon.stub(combinedCourseBlueprintController, 'findByOrganizationId').callsFake((_, h) => h.response());

      const httpTestServer = new HttpTestServer();
      httpTestServer.setupAuthentication();
      await httpTestServer.register(combinedCourseBlueprintRoute);

      // when
      await httpTestServer.request(
        'GET',
        '/api/organizations/456/combined-course-blueprints',
        null,
        null,
        generateAuthenticatedUserRequestHeaders({ userId: 123 }),
      );

      // then
      expect(securityPreHandlers.checkOrganizationAccess).to.have.been.called;
    });
  });

  describe('PATCH /api/admin/combined-course-blueprints/{combinedCourseBlueprintId}', function () {
    it('should call prehandler', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').callsFake((request, h) => h.response(true));
      sinon.stub(combinedCourseBlueprintController, 'update').callsFake((_, h) => h.response());

      const combinedCourseBlueprintId = '456';

      const payload = {
        data: {
          type: 'combined-course-blueprints',
          attributes: {
            name: 'Mon parcours combiné',
            'internal-name': 'Mon schéma de parcours combiné',
            description: 'La description combinix',
            illustration: 'illustration.svg',
            'reward-requirements': 'Description of the reward requirements',
          },
        },
      };

      const httpTestServer = new HttpTestServer();
      httpTestServer.setupAuthentication();
      await httpTestServer.register(combinedCourseBlueprintRoute);

      // when
      await httpTestServer.request(
        'PATCH',
        `/api/admin/combined-course-blueprints/${combinedCourseBlueprintId}`,
        payload,
        null,
        generateAuthenticatedUserRequestHeaders({ userId: 123 }),
      );

      // then
      expect(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin).to.have.been.called;
    });
  });

  describe('GET /api/organizations/{organizationId}/combined-course-blueprints/{blueprintId}', function () {
    it('should call findOverviewById', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkUserBelongsToOrganization').resolves(() => true);
      sinon.stub(questSecurityPreHandlers, 'checkCombinedCourseBlueprintBelongsToOrganization').resolves(() => true);
      sinon.stub(combinedCourseBlueprintController, 'findOverviewById').callsFake((_, h) => h.response());

      const httpTestServer = new HttpTestServer();
      httpTestServer.setupAuthentication();
      await httpTestServer.register(combinedCourseBlueprintRoute);

      // when
      await httpTestServer.request(
        'GET',
        '/api/organizations/456/combined-course-blueprints/789',
        null,
        null,
        generateAuthenticatedUserRequestHeaders({ userId: 123 }),
      );

      // then
      expect(combinedCourseBlueprintController.findOverviewById).to.have.been.called;
    });

    describe('when the user does not belong to the organization', function () {
      it('should return 403', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'checkUserBelongsToOrganization')
          .callsFake((request, h) => h.response().code(403).takeover());
        sinon.stub(questSecurityPreHandlers, 'checkCombinedCourseBlueprintBelongsToOrganization').resolves(() => true);
        sinon.stub(combinedCourseBlueprintController, 'findOverviewById').callsFake((_, h) => h.response());

        const httpTestServer = new HttpTestServer();
        httpTestServer.setupAuthentication();
        await httpTestServer.register(combinedCourseBlueprintRoute);

        // when
        const response = await httpTestServer.request(
          'GET',
          '/api/organizations/456/combined-course-blueprints/789',
          null,
          null,
          generateAuthenticatedUserRequestHeaders({ userId: 123 }),
        );

        // then
        expect(response.statusCode).equal(403);
      });
    });

    describe('when the combined course blueprint does not belong to the organization', function () {
      it('should return 403', async function () {
        // given
        sinon.stub(securityPreHandlers, 'checkUserBelongsToOrganization').resolves(() => true);
        sinon
          .stub(questSecurityPreHandlers, 'checkCombinedCourseBlueprintBelongsToOrganization')
          .callsFake((request, h) => h.response().code(403).takeover());
        sinon.stub(combinedCourseBlueprintController, 'findOverviewById').callsFake((_, h) => h.response());

        const httpTestServer = new HttpTestServer();
        httpTestServer.setupAuthentication();
        await httpTestServer.register(combinedCourseBlueprintRoute);

        // when
        const response = await httpTestServer.request(
          'GET',
          '/api/organizations/456/combined-course-blueprints/789',
          null,
          null,
          generateAuthenticatedUserRequestHeaders({ userId: 123 }),
        );

        // then
        expect(response.statusCode).equal(403);
      });
    });
  });
});
