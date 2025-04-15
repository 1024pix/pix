import { organizationAdminController } from '../../../../../src/organizational-entities/application/organization/organization.admin.controller.js';
import * as organizationAdminRoutes from '../../../../../src/organizational-entities/application/organization/organization.admin.route.js';
import {
  DpoEmailInvalid,
  FeatureNotFound,
  FeatureParamsNotProcessable,
  OrganizationBatchUpdateError,
  OrganizationNotFound,
  TagNotFoundError,
  UnableToAttachChildOrganizationToParentOrganizationError,
} from '../../../../../src/organizational-entities/domain/errors.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { CsvImportError, NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { identifiersType } from '../../../../../src/shared/domain/types/identifiers-type.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Integration | Organizational Entities | Application | Route | Admin | Organization', function () {
  let httpTestServer;

  beforeEach(async function () {
    httpTestServer = new HttpTestServer();
    await httpTestServer.register(organizationAdminRoutes);
  });

  afterEach(function () {
    sinon.restore();
  });

  describe('GET /api/admin/organizations', function () {
    const method = 'GET';

    context('when user is not allowed to access resource', function () {
      it('should resolve a 403 HTTP response', async function () {
        // given
        const method = 'GET';
        const url = '/api/admin/organizations';

        sinon
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
          .returns((request, h) => h.response().code(403).takeover());
        sinon.stub(organizationAdminController, 'findPaginatedFilteredOrganizations').returns('ok');

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    context('when request is invalid', function () {
      it('should return BadRequest (400) if id is not numeric', async function () {
        // given
        const idNotNumeric = 'foo';
        const url = `/api/admin/organizations?filter[id]=${idNotNumeric}`;

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(400);
      });

      context('when id is outside number limits', function () {
        it('should return HTTP statusCode 400 if id number is less than the minimum value', async function () {
          // given
          const minNumberLimit = identifiersType.positiveInteger32bits.min;
          const wrongNumber = minNumberLimit - 1;
          const url = `/api/admin/organizations?filter[id]=${wrongNumber}`;

          // when
          const response = await httpTestServer.request(method, url);
          // then
          expect(response.statusCode).to.equal(400);
        });

        it('should return HTTP statusCode 400 if id number is greater than the maximum value', async function () {
          // given

          const maxNumberLimit = identifiersType.positiveInteger32bits.max;
          const wrongNumber = maxNumberLimit + 1;
          const url = `/api/admin/organizations?filter[id]=${wrongNumber}`;

          // when
          const response = await httpTestServer.request(method, url);

          // then
          expect(response.statusCode).to.equal(400);
        });
      });
    });
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

  describe('PATCH /api/admin/organizations/{id}', function () {
    it('returns forbidden access if admin member has CERTIF role', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleCertif').callsFake((request, h) => h.response(true));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));

      // when
      const response = await httpTestServer.request('PATCH', '/api/admin/organizations/1', {
        data: {
          id: '1',
          type: 'organizations',
          attributes: {
            name: 'Super Tag',
            type: 'SCO',
          },
        },
      });

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('POST /api/admin/organizations/import-tags-csv', function () {
    const method = 'POST';
    const url = '/api/admin/organizations/import-tags-csv';
    const payload = 'some payload';

    beforeEach(async function () {
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').resolves(true);
      sinon.stub(organizationAdminController, 'addTagsToOrganizations');
    });

    it('checks user has SUPER_ADMIN role', async function () {
      // given
      organizationAdminController.addTagsToOrganizations.resolves(true);

      // when
      await httpTestServer.request(method, url, payload);

      // then
      expect(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin).to.have.been.calledOnce;
    });

    describe('when CSV file format is invalid', function () {
      it('throws a CsvImportError', async function () {
        // given
        organizationAdminController.addTagsToOrganizations.rejects(new CsvImportError());

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(412);
      });
    });

    describe('when a tag name does not exist', function () {
      it('throws a TagNotFoundError', async function () {
        // given
        organizationAdminController.addTagsToOrganizations.rejects(new TagNotFoundError());

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(404);
      });
    });

    describe('when an organization ID does not exist', function () {
      it('throws a OrganizationNotFound', async function () {
        // given
        organizationAdminController.addTagsToOrganizations.rejects(new OrganizationNotFound());

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(422);
      });
    });
  });

  describe('POST /api/admin/organizations', function () {
    it('returns forbidden access if admin member has CERTIF role', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleCertif').callsFake((request, h) => h.response(true));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));

      // when
      const response = await httpTestServer.request('POST', '/api/admin/organizations', {
        data: {
          type: 'organizations',
          attributes: {
            name: 'Super Tag',
            type: 'SCO',
          },
        },
      });

      // then
      expect(response.statusCode).to.equal(403);
    });
  });
});
