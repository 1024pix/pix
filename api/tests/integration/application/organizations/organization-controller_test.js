import { expect, sinon, domainBuilder, HttpTestServer } from '../../../test-helper.js';
import { securityPreHandlers } from '../../../../lib/application/security-pre-handlers.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';

import { OrganizationInvitation } from '../../../../lib/domain/models/OrganizationInvitation.js';
import { getCertificationAttestationsPdf as certificationAttestationPdf } from '../../../../lib/infrastructure/utils/pdf/certification-attestation-pdf.js';
import * as moduleUnderTest from '../../../../lib/application/organizations/index.js';
import { NoCertificationAttestationForDivisionError } from '../../../../lib/domain/errors.js';

describe('Integration | Application | Organizations | organization-controller', function () {
  let sandbox;
  let httpTestServer;

  beforeEach(async function () {
    sandbox = sinon.createSandbox();
    sandbox.stub(usecases, 'findPaginatedFilteredOrganizationMemberships');
    sandbox.stub(usecases, 'createOrganizationInvitations');
    sandbox.stub(usecases, 'acceptOrganizationInvitation');
    sandbox.stub(usecases, 'findPendingOrganizationInvitations');
    sandbox.stub(usecases, 'findCertificationAttestationsForDivision');
    sandbox.stub(usecases, 'findDivisionsByOrganization');
    sandbox.stub(usecases, 'findGroupsByOrganization');
    sandbox.stub(usecases, 'findOrganizationPlacesLot');

    sandbox.stub(certificationAttestationPdf, 'getCertificationAttestationsPdfBuffer');

    sandbox.stub(securityPreHandlers, 'checkUserIsAdminInOrganization');
    sandbox.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin');
    sandbox.stub(securityPreHandlers, 'checkUserBelongsToOrganizationManagingStudents');
    sandbox.stub(securityPreHandlers, 'checkUserBelongsToScoOrganizationAndManagesStudents');
    sandbox.stub(securityPreHandlers, 'checkUserBelongsToSupOrganizationAndManagesStudents');
    sandbox.stub(securityPreHandlers, 'checkUserIsAdminInSCOOrganizationManagingStudents');
    sandbox.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf');
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
        securityPreHandlers.adminMemberHasAtLeastOneAccessOf.returns(() => true);
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

  describe('#findPendingInvitations', function () {
    context('Success cases', function () {
      it('should return an HTTP response with status code 200', async function () {
        // given
        const invitation = domainBuilder.buildOrganizationInvitation({
          organizationId: 1,
          status: OrganizationInvitation.StatusType.PENDING,
        });
        usecases.findPendingOrganizationInvitations.resolves([invitation]);
        securityPreHandlers.checkUserIsAdminInOrganization.returns(true);

        // when
        const response = await httpTestServer.request('GET', '/api/organizations/1/invitations');

        // then
        expect(response.statusCode).to.equal(200);
      });
    });
  });

  describe('#findOrganizationPlacesLot', function () {
    context('Success cases', function () {
      it('should return an HTTP response with status code 200', async function () {
        // given
        const organizationId = domainBuilder.buildOrganization().id;
        const place = domainBuilder.buildOrganizationPlacesLotManagement({
          organizationId,
          count: 18,
          activationDate: new Date('2020-01-01'),
          expirationDate: new Date('2021-01-01'),
          reference: 'Toho Godzilla',
          category: 'T2',
        });
        usecases.findOrganizationPlacesLot.resolves([place]);
        securityPreHandlers.adminMemberHasAtLeastOneAccessOf.returns(() => true);

        // when
        const response = await httpTestServer.request('GET', `/api/admin/organizations/${organizationId}/places`);

        // then
        expect(response.statusCode).to.equal(200);
      });
    });
  });

  describe('#downloadCertificationAttestationsForDivision', function () {
    context('Success cases', function () {
      it('should return an HTTP response with status code 200', async function () {
        // given
        const certifications = [
          domainBuilder.buildPrivateCertificateWithCompetenceTree(),
          domainBuilder.buildPrivateCertificateWithCompetenceTree(),
        ];
        const buffer = 'buffer';
        securityPreHandlers.checkUserIsAdminInSCOOrganizationManagingStudents.returns(true);
        usecases.findCertificationAttestationsForDivision.resolves(certifications);
        certificationAttestationPdf.getCertificationAttestationsPdfBuffer.resolves(buffer);

        // when
        const response = await httpTestServer.request(
          'GET',
          '/api/organizations/1234/certification-attestations?division=3b&isFrenchDomainExtension=true&lang=fr',
        );

        // then
        expect(response.statusCode).to.equal(204);
      });
    });

    context('Error cases', function () {
      context('when user is not allowed to access resource', function () {
        it('should resolve a 403 HTTP response', async function () {
          // given
          securityPreHandlers.checkUserIsAdminInSCOOrganizationManagingStudents.callsFake((request, h) => {
            return Promise.resolve(h.response().code(403).takeover());
          });

          // when
          const response = await httpTestServer.request(
            'GET',
            '/api/organizations/1234/certification-attestations?division=3b&isFrenchDomainExtension=true&lang=fr',
          );

          // then
          expect(response.statusCode).to.equal(403);
        });
      });

      context('when no division is provided as query', function () {
        it('should resolve a 400 HTTP response', async function () {
          // when
          const response = await httpTestServer.request(
            'GET',
            '/api/organizations/1234/certification-attestations?isFrenchDomainExtension=true',
          );

          // then
          expect(response.statusCode).to.equal(400);
        });
      });

      context('when no isFrenchDomainExtension is provided as query', function () {
        it('should resolve a 400 HTTP response', async function () {
          // when
          const response = await httpTestServer.request(
            'GET',
            '/api/organizations/1234/certification-attestations?division=3A',
          );

          // then
          expect(response.statusCode).to.equal(400);
        });
      });

      context('when no attestation are found', function () {
        it('should resolve a 400 HTTP response', async function () {
          // given
          const division = '3b';
          securityPreHandlers.checkUserIsAdminInSCOOrganizationManagingStudents.returns(true);
          usecases.findCertificationAttestationsForDivision.rejects(
            new NoCertificationAttestationForDivisionError(division),
          );

          // when
          const response = await httpTestServer.request(
            'GET',
            '/api/organizations/1234/certification-attestations?division=3b&isFrenchDomainExtension=true&lang=fr',
          );

          // then
          const parsedPayload = JSON.parse(response.payload);
          expect(response.statusCode).to.equal(400);
          expect(parsedPayload.errors[0].detail).to.equal(
            `Aucune attestation de certification pour la classe ${division}.`,
          );
        });
      });
    });
  });

  describe('#getGroups', function () {
    context('when the user is a member of the organization', function () {
      it('returns organizations groups', async function () {
        const organizationId = 1234;
        securityPreHandlers.checkUserBelongsToSupOrganizationAndManagesStudents.returns(true);
        usecases.findGroupsByOrganization.withArgs({ organizationId }).resolves([{ name: 'G1' }]);

        const response = await httpTestServer.request('GET', `/api/organizations/${organizationId}/groups`);

        expect(response.statusCode).to.equal(200);
        expect(response.result.data).to.deep.equal([{ id: 'G1', type: 'groups', attributes: { name: 'G1' } }]);
      });
    });

    context('when the user is not a member of the organization', function () {
      it('returns organizations groups', async function () {
        const organizationId = 1234;
        securityPreHandlers.checkUserBelongsToSupOrganizationAndManagesStudents.callsFake((request, h) => {
          return Promise.resolve(h.response().code(403).takeover());
        });
        const response = await httpTestServer.request('GET', `/api/organizations/${organizationId}/groups`);

        expect(response.statusCode).to.equal(403);
      });
    });

    context('when the organization id is invalid', function () {
      it('returns organizations groups', async function () {
        const response = await httpTestServer.request('GET', `/api/organizations/ABC/groups`);

        expect(response.statusCode).to.equal(400);
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
        const response = await httpTestServer.request('GET', `/api/organizations/ABC/groups`);

        expect(response.statusCode).to.equal(400);
      });
    });
  });
});
