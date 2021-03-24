const { expect, sinon, domainBuilder, HttpTestServer } = require('../../../test-helper');
const _ = require('lodash');

const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const usecases = require('../../../../lib/domain/usecases');
const OrganizationInvitation = require('../../../../lib/domain/models/OrganizationInvitation');

const moduleUnderTest = require('../../../../lib/application/organizations');

describe('Integration | Application | Organizations | organization-controller', function() {

  const organization = domainBuilder.buildOrganization();

  let sandbox;
  let httpTestServer;

  beforeEach(function() {
    sandbox = sinon.createSandbox();
    sandbox.stub(usecases, 'updateOrganizationInformation');
    sandbox.stub(usecases, 'findPaginatedFilteredOrganizationMemberships');
    sandbox.stub(usecases, 'findPaginatedFilteredSchoolingRegistrations');
    sandbox.stub(usecases, 'createOrganizationInvitations');
    sandbox.stub(usecases, 'acceptOrganizationInvitation');
    sandbox.stub(usecases, 'findPendingOrganizationInvitations');
    sandbox.stub(usecases, 'attachTargetProfilesToOrganization');

    sandbox.stub(securityPreHandlers, 'checkUserHasRolePixMaster');
    sandbox.stub(securityPreHandlers, 'checkUserIsAdminInOrganization');
    sandbox.stub(securityPreHandlers, 'checkUserIsAdminInOrganizationOrHasRolePixMaster');
    sandbox.stub(securityPreHandlers, 'checkUserBelongsToOrganizationManagingStudents');
    sandbox.stub(securityPreHandlers, 'checkUserBelongsToScoOrganizationAndManagesStudents');
    sandbox.stub(securityPreHandlers, 'checkUserBelongsToOrganizationOrHasRolePixMaster');
    httpTestServer = new HttpTestServer(moduleUnderTest);
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('#updateOrganizationInformation', function() {

    const payload = {
      data: {
        type: 'organizations',
        id: '1',
        attributes: {
          'name': 'The name of the organization',
          'type': 'PRO',
          'code': 'ABCD12',
          'logo-url': 'http://log.url',
          'external-id': '02A2145V',
          'province-code': '02A',
          'email': 'sco.generic.newaccount@example.net',
          'credit': 10,
        },
      },
    };

    context('Success cases', function() {

      beforeEach(function() {
        securityPreHandlers.checkUserHasRolePixMaster.callsFake((request, h) => h.response(true));
      });

      it('should resolve a 200 HTTP response', async function() {
        // given
        usecases.updateOrganizationInformation.resolves(organization);

        // when
        const response = await httpTestServer.request('PATCH', '/api/organizations/1234', payload);

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should return a JSON API organization', async function() {
        // given
        usecases.updateOrganizationInformation.resolves(organization);

        // when
        const response = await httpTestServer.request('PATCH', '/api/organizations/1234', payload);

        // then
        expect(response.result.data.type).to.equal('organizations');
      });
    });

    context('Error cases', function() {

      context('when user is not allowed to access resource', function() {

        beforeEach(function() {
          securityPreHandlers.checkUserHasRolePixMaster.callsFake((request, h) => {
            return Promise.resolve(h.response().code(403).takeover());
          });
        });

        it('should resolve a 403 HTTP response', async function() {
          // when
          const response = await httpTestServer.request('PATCH', '/api/organizations/1234', payload);

          // then
          expect(response.statusCode).to.equal(403);
        });
      });
    });
  });

  describe('#findPaginatedFilteredOrganizationMemberships', function() {

    context('Success cases', function() {

      beforeEach(function() {
        securityPreHandlers.checkUserBelongsToOrganizationOrHasRolePixMaster.returns(true);
      });

      const membership = domainBuilder.buildMembership();

      it('should return an HTTP response with status code 200', async function() {
        // given
        usecases.findPaginatedFilteredOrganizationMemberships.resolves({ models: [membership], pagination: {} });

        // when
        const response = await httpTestServer.request('GET', '/api/organizations/1234/memberships');

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should return an HTTP response formatted as JSON:API', async function() {
        // given
        usecases.findPaginatedFilteredOrganizationMemberships.resolves({ models: [membership], pagination: {} });

        // when
        const response = await httpTestServer.request('GET', '/api/organizations/1234/memberships');

        // then
        expect(response.result.data[0].type).to.equal('memberships');
        expect(response.result.data[0].id).to.equal(membership.id.toString());
      });

      it('should return a JSON:API response including organization, organization role & user information', async function() {
        // given
        usecases.findPaginatedFilteredOrganizationMemberships.resolves(({ models: [membership], pagination: {} }));

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

  describe('#findOrganizationsStudentsWithUserInfo', function() {

    beforeEach(function() {
      securityPreHandlers.checkUserBelongsToOrganizationManagingStudents.returns(true);
    });

    context('Success cases', function() {

      const studentWithUserInfo = domainBuilder.buildUserWithSchoolingRegistration();

      it('should return an HTTP response with status code 200', async function() {
        // given
        usecases.findPaginatedFilteredSchoolingRegistrations.resolves({ data: [studentWithUserInfo] });

        // when
        const response = await httpTestServer.request('GET', '/api/organizations/1234/students');

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should return an HTTP response formatted as JSON:API', async function() {
        // given
        usecases.findPaginatedFilteredSchoolingRegistrations.resolves({ data: [studentWithUserInfo] });

        // when
        const response = await httpTestServer.request('GET', '/api/organizations/1234/students');

        // then
        expect(response.result.data[0].type).to.equal('students');
      });
    });

    context('Error cases', function() {

      context('when user is not allowed to access resource', function() {

        beforeEach(function() {
          securityPreHandlers.checkUserBelongsToOrganizationManagingStudents.callsFake((request, h) => {
            return Promise.resolve(h.response().code(403).takeover());
          });
        });

        it('should resolve a 403 HTTP response', async function() {
          // when
          const response = await httpTestServer.request('GET', '/api/organizations/1234/students');

          // then
          expect(response.statusCode).to.equal(403);
        });
      });
    });
  });

  describe('#sendInvitations', function() {

    context('Success cases', function() {

      const status = OrganizationInvitation.StatusType.PENDING;
      const invitation = domainBuilder.buildOrganizationInvitation({ status });

      const payload = {
        data: {
          type: 'organization-invitations',
          attributes: {
            email: invitation.email,
          },
        },
      };

      beforeEach(function() {
        securityPreHandlers.checkUserIsAdminInOrganizationOrHasRolePixMaster.returns(true);
      });

      it('should return an HTTP response with status code 201', async function() {
        // given
        usecases.createOrganizationInvitations.resolves([invitation]);

        // when
        const response = await httpTestServer.request('POST', '/api/organizations/1/invitations', payload);

        // then
        expect(response.statusCode).to.equal(201);
      });

      it('should return the created invitation with status pending', async function() {
        // given
        const expectedResult = {
          type: 'organization-invitations',
          attributes: {
            'organization-id': invitation.organizationId,
            email: invitation.email,
            status,
            'updated-at': invitation.updatedAt,
          },
        };
        usecases.createOrganizationInvitations.resolves([invitation]);

        // when
        const response = await httpTestServer.request('POST', `/api/organizations/${invitation.organizationId}/invitations`, payload);

        // then
        expect(_.omit(response.result.data[0], 'id', 'attributes.organization-name')).to.deep.equal(expectedResult);
      });
    });
  });

  describe('#findPendingInvitations', function() {

    context('Success cases', function() {

      const invitation = domainBuilder.buildOrganizationInvitation({
        organizationId: 1,
        status: OrganizationInvitation.StatusType.PENDING,
      });

      beforeEach(function() {
        securityPreHandlers.checkUserIsAdminInOrganization.returns(true);
      });

      it('should return an HTTP response with status code 200', async function() {
        // given
        usecases.findPendingOrganizationInvitations.resolves([invitation]);

        // when
        const response = await httpTestServer.request('GET', '/api/organizations/1/invitations');

        // then
        expect(response.statusCode).to.equal(200);
      });
    });
  });

  describe('#attachTargetProfilesToOrganization', function() {

    const payload = {
      data: {
        type: 'target-profiles-shares',
        attributes: {
          'target-profiles-to-attach': [1, 2],
        },
      },
    };

    context('Error cases', function() {

      context('when user is not Pix Master', function() {

        beforeEach(function() {
          securityPreHandlers.checkUserHasRolePixMaster.callsFake((request, h) => {
            return Promise.resolve(h.response().code(403).takeover());
          });
        });

        it('should return a 403 HTTP response', async function() {
          // when
          const response = await httpTestServer.request('POST', '/api/organizations/1234/target-profiles', payload);
          // then
          expect(response.statusCode).to.equal(403);
        });
      });

      context('when target-profile-id does not contain only numbers', function() {

        beforeEach(function() {
          securityPreHandlers.checkUserHasRolePixMaster.callsFake((request, h) => h.response(true));
        });

        it('should return a 404 HTTP response', async function() {
          // when
          payload.data.attributes['target-profiles-to-attach'] = ['sdqdqsd', 'qsqsdqd'];
          const response = await httpTestServer.request('POST', '/api/organizations/1234/target-profiles', payload);

          // then
          expect(response.statusCode).to.equal(404);
          expect(response.payload).to.have.string('L\'id d\'un des profils cible n\'est pas valide');
        });
      });
    });
  });
});
