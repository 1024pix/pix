const { expect, sinon, domainBuilder, HttpTestServer } = require('../../../test-helper');

const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const usecases = require('../../../../lib/domain/usecases');
const OrganizationInvitation = require('../../../../lib/domain/models/OrganizationInvitation');
const ScoOrganizationParticipant = require('../../../../lib/domain/read-models/ScoOrganizationParticipant');
const SupOrganizationParticipant = require('../../../../lib/domain/read-models/SupOrganizationParticipant');
const certificationAttestationPdf = require('../../../../lib/infrastructure/utils/pdf/certification-attestation-pdf');

const moduleUnderTest = require('../../../../lib/application/organizations');
const { NoCertificationAttestationForDivisionError } = require('../../../../lib/domain/errors');

describe('Integration | Application | Organizations | organization-controller', function () {
  let sandbox;
  let httpTestServer;

  beforeEach(async function () {
    sandbox = sinon.createSandbox();
    sandbox.stub(usecases, 'updateOrganizationInformation');
    sandbox.stub(usecases, 'findPaginatedFilteredOrganizationMemberships');
    sandbox.stub(usecases, 'findPaginatedFilteredScoParticipants');
    sandbox.stub(usecases, 'findPaginatedFilteredSupParticipants');
    sandbox.stub(usecases, 'createOrganizationInvitations');
    sandbox.stub(usecases, 'acceptOrganizationInvitation');
    sandbox.stub(usecases, 'findPendingOrganizationInvitations');
    sandbox.stub(usecases, 'findCertificationAttestationsForDivision');
    sandbox.stub(usecases, 'findGroupsByOrganization');
    sandbox.stub(usecases, 'findDivisionsByOrganization');
    sandbox.stub(usecases, 'getPaginatedParticipantsForAnOrganization');
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

  describe('#updateOrganizationInformation', function () {
    const payload = {
      data: {
        type: 'organizations',
        id: '1',
        attributes: {
          name: 'The name of the organization',
          type: 'PRO',
          code: 'ABCD12',
          'logo-url': 'http://log.url',
          'external-id': '02A2145V',
          'province-code': '02A',
          email: 'sco.generic.newaccount@example.net',
          credit: 10,
        },
      },
    };

    context('Success cases', function () {
      it('should resolve a 200 HTTP response', async function () {
        // given
        const organization = domainBuilder.buildOrganization();
        usecases.updateOrganizationInformation.resolves(organization);
        securityPreHandlers.adminMemberHasAtLeastOneAccessOf.returns(() => true);

        // when
        const response = await httpTestServer.request('PATCH', '/api/admin/organizations/1234', payload);

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should return a JSON API organization', async function () {
        // given
        const organization = domainBuilder.buildOrganization();
        usecases.updateOrganizationInformation.resolves(organization);
        securityPreHandlers.adminMemberHasAtLeastOneAccessOf.returns(() => true);

        // when
        const response = await httpTestServer.request('PATCH', '/api/admin/organizations/1234', payload);

        // then
        expect(response.result.data.type).to.equal('organizations');
      });
    });

    context('Error cases', function () {
      context('when user is not allowed to access resource', function () {
        it('should resolve a 403 HTTP response', async function () {
          // given
          securityPreHandlers.adminMemberHasAtLeastOneAccessOf.returns((request, h) =>
            h.response().code(403).takeover()
          );

          // when
          const response = await httpTestServer.request('PATCH', '/api/admin/organizations/1234', payload);

          // then
          expect(response.statusCode).to.equal(403);
        });
      });
    });
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

  describe('#findPaginatedFilteredScoParticipants', function () {
    context('Success cases', function () {
      it('should return an HTTP response with status code 200', async function () {
        // given
        const scoOrganizationParticipant = new ScoOrganizationParticipant();
        usecases.findPaginatedFilteredScoParticipants.resolves({ data: [scoOrganizationParticipant] });
        securityPreHandlers.checkUserBelongsToScoOrganizationAndManagesStudents.returns(true);

        // when
        const response = await httpTestServer.request('GET', '/api/organizations/1234/sco-participants');

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should return an HTTP response formatted as JSON:API', async function () {
        // given
        const scoOrganizationParticipant = new ScoOrganizationParticipant();
        usecases.findPaginatedFilteredScoParticipants.resolves({ data: [scoOrganizationParticipant] });
        securityPreHandlers.checkUserBelongsToScoOrganizationAndManagesStudents.returns(true);

        // when
        const response = await httpTestServer.request('GET', '/api/organizations/1234/sco-participants');

        // then
        expect(response.result.data[0].type).to.equal('sco-organization-participants');
      });
    });

    context('Error cases', function () {
      context('when user is not allowed to access resource', function () {
        it('should resolve a 403 HTTP response', async function () {
          // given
          securityPreHandlers.checkUserBelongsToScoOrganizationAndManagesStudents.callsFake((request, h) => {
            return Promise.resolve(h.response().code(403).takeover());
          });

          // when
          const response = await httpTestServer.request('GET', '/api/organizations/1234/sco-participants');

          // then
          expect(response.statusCode).to.equal(403);
        });
      });
    });
  });

  describe('#findPaginatedFilteredSupParticipants', function () {
    context('Success cases', function () {
      it('should return an HTTP response with status code 200', async function () {
        // given
        const supOrganizationParticipant = new SupOrganizationParticipant();
        usecases.findPaginatedFilteredSupParticipants.resolves({ data: [supOrganizationParticipant] });
        securityPreHandlers.checkUserBelongsToSupOrganizationAndManagesStudents.returns(true);

        // when
        const response = await httpTestServer.request('GET', '/api/organizations/1234/sup-participants');

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should return an HTTP response formatted as JSON:API', async function () {
        // given
        const supOrganizationParticipant = new SupOrganizationParticipant();
        usecases.findPaginatedFilteredSupParticipants.resolves({ data: [supOrganizationParticipant] });
        securityPreHandlers.checkUserBelongsToSupOrganizationAndManagesStudents.returns(true);

        // when
        const response = await httpTestServer.request('GET', '/api/organizations/1234/sup-participants');

        // then
        expect(response.result.data[0].type).to.equal('sup-organization-participants');
      });
    });

    context('Error cases', function () {
      context('when user is not allowed to access resource', function () {
        it('should resolve a 403 HTTP response', async function () {
          // given
          securityPreHandlers.checkUserBelongsToSupOrganizationAndManagesStudents.callsFake((request, h) => {
            return Promise.resolve(h.response().code(403).takeover());
          });

          // when
          const response = await httpTestServer.request('GET', '/api/organizations/1234/sup-participants');

          // then
          expect(response.statusCode).to.equal(403);
        });
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
          '/api/organizations/1234/certification-attestations?division=3b&isFrenchDomainExtension=true'
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
            '/api/organizations/1234/certification-attestations?division=3b&isFrenchDomainExtension=true'
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
            '/api/organizations/1234/certification-attestations?isFrenchDomainExtension=true'
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
            '/api/organizations/1234/certification-attestations?division=3A'
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
            new NoCertificationAttestationForDivisionError(division)
          );

          // when
          const response = await httpTestServer.request(
            'GET',
            '/api/organizations/1234/certification-attestations?division=3b&isFrenchDomainExtension=true'
          );

          // then
          const parsedPayload = JSON.parse(response.payload);
          expect(response.statusCode).to.equal(400);
          expect(parsedPayload.errors[0].detail).to.equal(
            `Aucune attestation de certification pour la classe ${division}.`
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

  describe('#getPaginatedParticipantsForAnOrganization', function () {
    context('when the organization has participants', function () {
      it('returns organization participants', async function () {
        const organizationId = 5678;
        usecases.getPaginatedParticipantsForAnOrganization
          .withArgs({ organizationId, page: {}, filters: {}, sort: {} })
          .resolves({
            organizationParticipants: [
              {
                id: 5678,
                firstName: 'Mei',
                lastName: 'Lee',
              },
            ],
            pagination: 1,
          });
        securityPreHandlers.checkUserBelongsToOrganization.returns(() => true);

        const response = await httpTestServer.request('GET', `/api/organizations/${organizationId}/participants`);

        expect(response.statusCode).to.equal(200);
        expect(response.result.data).to.deep.equal([
          {
            id: '5678',
            type: 'organization-participants',
            attributes: {
              'first-name': 'Mei',
              'last-name': 'Lee',
            },
          },
        ]);
      });
    });
  });
});
