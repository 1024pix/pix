import * as moduleUnderTest from '../../../../lib/application/organizations/index.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';
import { securityPreHandlers } from '../../../../src/shared/application/security-pre-handlers.js';
import { domainBuilder, expect, HttpTestServer, sinon } from '../../../test-helper.js';

describe('Integration | Application | Organizations | organization-controller', function () {
  let sandbox;
  let httpTestServer;

  beforeEach(async function () {
    sandbox = sinon.createSandbox();
    sandbox.stub(usecases, 'findPaginatedFilteredOrganizationMemberships');
    sandbox.stub(usecases, 'findDivisionsByOrganization');
    sandbox.stub(securityPreHandlers, 'checkUserIsAdminInOrganization');
    sandbox.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin');
    sandbox.stub(securityPreHandlers, 'checkUserBelongsToOrganizationManagingStudents');
    sandbox.stub(securityPreHandlers, 'checkUserBelongsToScoOrganizationAndManagesStudents');
    sandbox.stub(securityPreHandlers, 'checkUserBelongsToSupOrganizationAndManagesStudents');
    sandbox.stub(securityPreHandlers, 'checkUserIsAdminInSCOOrganizationManagingStudents');
    sandbox.stub(securityPreHandlers, 'hasAtLeastOneAccessOf');
    sandbox.stub(securityPreHandlers, 'checkUserBelongsToOrganization');
    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('#findPaginatedFilteredOrganizationMembershipsForAdmin', function () {
    context('Success cases', function () {
      beforeEach(function () {
        securityPreHandlers.hasAtLeastOneAccessOf.returns(() => true);
      });

      it('should return an HTTP response with status code 200', async function () {
        // given
        const membership = domainBuilder.buildMembership();
        usecases.findPaginatedFilteredOrganizationMemberships.resolves({ models: [membership], pagination: {} });

        // when
        const response = await httpTestServer.request('GET', '/api/admin/organizations/1234/memberships');

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should return an HTTP response formatted as JSON:API', async function () {
        // given
        const membership = domainBuilder.buildMembership();
        usecases.findPaginatedFilteredOrganizationMemberships.resolves({ models: [membership], pagination: {} });

        // when
        const response = await httpTestServer.request('GET', '/api/admin/organizations/1234/memberships');

        // then
        expect(response.result.data[0].type).to.equal('organization-memberships');
        expect(response.result.data[0].id).to.equal(membership.id.toString());
      });
    });
  });

  describe('#findPaginatedFilteredOrganizationMemberships', function () {
    context('Success cases', function () {
      beforeEach(function () {
        securityPreHandlers.checkUserBelongsToOrganization.returns(true);
      });

      it('should return an HTTP response with status code 200', async function () {
        // given
        const membership = domainBuilder.buildMembership();
        usecases.findPaginatedFilteredOrganizationMemberships.resolves({ models: [membership], pagination: {} });

        // when
        const response = await httpTestServer.request('GET', '/api/organizations/1234/memberships');

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should return an HTTP response formatted as JSON:API', async function () {
        // given
        const membership = domainBuilder.buildMembership();
        usecases.findPaginatedFilteredOrganizationMemberships.resolves({ models: [membership], pagination: {} });

        // when
        const response = await httpTestServer.request('GET', '/api/organizations/1234/memberships');

        // then
        expect(response.result.data[0].type).to.equal('memberships');
        expect(response.result.data[0].id).to.equal(membership.id.toString());
      });

      it('should return a JSON:API response including organization, organization role & user information', async function () {
        // given
        const membership = domainBuilder.buildMembership();
        usecases.findPaginatedFilteredOrganizationMemberships.resolves({ models: [membership], pagination: {} });

        // when
        const response = await httpTestServer.request('GET', '/api/organizations/1234/memberships');

        // then
        expect(response.result.included[0].type).to.equal('organizations');
        expect(response.result.included[0].id).to.equal(`${membership.organization.id}`);
        expect(response.result.included[1].type).to.equal('users');
        expect(response.result.included[1].id).to.equal(`${membership.user.id}`);
      });
    });
  });

  describe('#getDivisions', function () {
    context('when the user is a member of the organization', function () {
      it('returns organizations divisions', async function () {
        const organizationId = 1234;
        securityPreHandlers.checkUserBelongsToScoOrganizationAndManagesStudents.returns(true);
        usecases.findDivisionsByOrganization.withArgs({ organizationId }).resolves([{ name: 'G1' }]);

        const response = await httpTestServer.request('GET', `/api/organizations/${organizationId}/divisions`);

        expect(response.statusCode).to.equal(200);
        expect(response.result.data).to.deep.equal([{ id: 'G1', type: 'divisions', attributes: { name: 'G1' } }]);
      });
    });

    context('when the user is not a member of the organization', function () {
      it('returns organizations divisions', async function () {
        const organizationId = 1234;
        securityPreHandlers.checkUserBelongsToScoOrganizationAndManagesStudents.callsFake((request, h) => {
          return Promise.resolve(h.response().code(403).takeover());
        });
        const response = await httpTestServer.request('GET', `/api/organizations/${organizationId}/divisions`);

        expect(response.statusCode).to.equal(403);
      });
    });

    context('when the organization id is invalid', function () {
      it('returns returns an error 400', async function () {
        const response = await httpTestServer.request('GET', `/api/organizations/ABC/divisions`);

        expect(response.statusCode).to.equal(400);
      });
    });
  });
});
