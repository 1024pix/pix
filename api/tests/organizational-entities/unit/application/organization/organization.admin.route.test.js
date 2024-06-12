import { NotFoundError } from '../../../../../lib/domain/errors.js';
import { organizationAdminController } from '../../../../../src/organizational-entities/application/organization/organization.admin.controller.js';
import { organizationalEntitiesRoutes } from '../../../../../src/organizational-entities/application/routes.js';
import {
  AlreadyExistingOrganizationFeatureError,
  DpoEmailInvalid,
  FeatureNotFound,
  FeatureParamsNotProcessable,
  OrganizationBatchUpdateError,
  OrganizationNotFound,
  UnableToAttachChildOrganizationToParentOrganizationError,
} from '../../../../../src/organizational-entities/domain/errors.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Unit | Router | organization-router', function () {
  let httpTestServer;

  beforeEach(async function () {
    httpTestServer = new HttpTestServer();
    await httpTestServer.register(organizationalEntitiesRoutes[0]);
  });

  afterEach(function () {
    sinon.restore();
  });

  describe('POST /api/admin/organizations/add-organization-features', function () {
    const method = 'POST';
    const url = '/api/admin/organizations/add-organization-features';
    const payload = {};

    beforeEach(async function () {
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').resolves(true);
      sinon.stub(organizationAdminController, 'addOrganizationFeatureInBatch');
    });

    it('returns call the "checkAdminMemberHasRoleSuperAdmin" security prehandler', async function () {
      // given
      organizationAdminController.addOrganizationFeatureInBatch.resolves(true);

      // when
      await httpTestServer.request(method, url, payload);

      // then
      expect(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin).to.have.been.calledOnce;
    });

    it('returns call the "addOrganizationFeatureInBatch" controller', async function () {
      // given
      organizationAdminController.addOrganizationFeatureInBatch.resolves(true);

      // when
      await httpTestServer.request(method, url, payload);

      // then
      expect(organizationAdminController.addOrganizationFeatureInBatch).to.have.been.calledOnce;
    });

    context('when trying to add feature on non existing organization', function () {
      it('returns a 422 HTTP status code', async function () {
        organizationAdminController.addOrganizationFeatureInBatch.rejects(new OrganizationNotFound());

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(422);
      });
    });

    context('when trying to add non existing feature', function () {
      it('returns a 422 HTTP status code', async function () {
        organizationAdminController.addOrganizationFeatureInBatch.rejects(new FeatureNotFound());

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(422);
      });
    });

    context('when trying to add non processable params', function () {
      it('returns a 422 HTTP status code', async function () {
        organizationAdminController.addOrganizationFeatureInBatch.rejects(new FeatureParamsNotProcessable());

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(422);
      });
    });

    context('when trying to add already existing feature on organization', function () {
      it('returns a 409 HTTP status code', async function () {
        organizationAdminController.addOrganizationFeatureInBatch.rejects(
          new AlreadyExistingOrganizationFeatureError(),
        );

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(409);
      });
    });
  });

  describe('POST /api/admin/organizations/update-organizations', function () {
    const method = 'POST';
    const url = '/api/admin/organizations/update-organizations';
    const payload = {};

    beforeEach(async function () {
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').resolves(true);
      sinon.stub(organizationAdminController, 'updateOrganizationsInBatch');
    });

    it('returns call the "checkAdminMemberHasRoleSuperAdmin" security prehandler', async function () {
      // given
      organizationAdminController.updateOrganizationsInBatch.resolves(true);

      // when
      await httpTestServer.request(method, url, payload);

      // then
      expect(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin).to.have.been.calledOnce;
    });

    it('returns call the "updateOrganizationsInBatch" controller', async function () {
      // given
      organizationAdminController.updateOrganizationsInBatch.resolves(true);

      // when
      await httpTestServer.request(method, url, payload);

      // then
      expect(organizationAdminController.updateOrganizationsInBatch).to.have.been.calledOnce;
    });

    context('when managing import errors', function () {
      context('when trying to update non existing organization', function () {
        it('returns a 404 HTTP status code', async function () {
          // given
          organizationAdminController.updateOrganizationsInBatch.rejects(new NotFoundError());

          // when
          const response = await httpTestServer.request(method, url, payload);

          // then
          expect(response.statusCode).to.equal(404);
        });
      });

      context('when it is not able to link to the parent organization', function () {
        it('returns a 409 HTTP status code', async function () {
          // given
          organizationAdminController.updateOrganizationsInBatch.rejects(
            new UnableToAttachChildOrganizationToParentOrganizationError(),
          );

          // when
          const response = await httpTestServer.request(method, url, payload);

          // then
          expect(response.statusCode).to.equal(409);
        });
      });

      context('when data protection officer email is invalid', function () {
        it('returns a 422 HTTP status code', async function () {
          // given
          organizationAdminController.updateOrganizationsInBatch.rejects(new DpoEmailInvalid());

          // when
          const response = await httpTestServer.request(method, url, payload);

          // then
          expect(response.statusCode).to.equal(422);
        });
      });

      context('when an unexpected import error happens', function () {
        it('returns a 422 HTTP status code', async function () {
          // given
          organizationAdminController.updateOrganizationsInBatch.rejects(new OrganizationBatchUpdateError());

          // when
          const response = await httpTestServer.request(method, url, payload);

          // then
          expect(response.statusCode).to.equal(422);
        });
      });
    });
  });
});
