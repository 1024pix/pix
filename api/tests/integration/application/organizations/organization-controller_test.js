const { expect, sinon, domainBuilder, HttpTestServer } = require('../../../test-helper');
const _ = require('lodash');

const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const usecases = require('../../../../lib/domain/usecases');
const OrganizationInvitation = require('../../../../lib/domain/models/OrganizationInvitation');

const moduleUnderTest = require('../../../../lib/application/organizations');

describe('Integration | Application | Organizations | organization-controller', () => {

  const organization = domainBuilder.buildOrganization();

  let sandbox;
  let httpTestServer;

  beforeEach(() => {
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

  afterEach(() => {
    sandbox.restore();
  });

  describe('#updateOrganizationInformation', () => {

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

    context('Success cases', () => {

      beforeEach(() => {
        securityPreHandlers.checkUserHasRolePixMaster.callsFake((request, h) => h.response(true));
      });

      it('should resolve a 200 HTTP response', async () => {
        // given
        usecases.updateOrganizationInformation.resolves(organization);

        // when
        const response = await httpTestServer.request('PATCH', '/api/organizations/1234', payload);

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should return a JSON API organization', async () => {
        // given
        usecases.updateOrganizationInformation.resolves(organization);

        // when
        const response = await httpTestServer.request('PATCH', '/api/organizations/1234', payload);

        // then
        expect(response.result.data.type).to.equal('organizations');
      });
    });

    context('Error cases', () => {

      context('when user is not allowed to access resource', () => {

        beforeEach(() => {
          securityPreHandlers.checkUserHasRolePixMaster.callsFake((request, h) => {
            return Promise.resolve(h.response().code(403).takeover());
          });
        });

        it('should resolve a 403 HTTP response', async () => {
          // when
          const response = await httpTestServer.request('PATCH', '/api/organizations/1234', payload);

          // then
          expect(response.statusCode).to.equal(403);
        });
      });
    });
  });

  describe('#findPaginatedFilteredOrganizationMemberships', () => {

    context('Success cases', () => {

      beforeEach(() => {
        securityPreHandlers.checkUserBelongsToOrganizationOrHasRolePixMaster.returns(true);
      });

      const membership = domainBuilder.buildMembership();

      it('should return an HTTP response with status code 200', async () => {
        // given
        usecases.findPaginatedFilteredOrganizationMemberships.resolves({ models: [membership], pagination: {} });

        // when
        const response = await httpTestServer.request('GET', '/api/organizations/1234/memberships');

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should return an HTTP response formatted as JSON:API', async () => {
        // given
        usecases.findPaginatedFilteredOrganizationMemberships.resolves({ models: [membership], pagination: {} });

        // when
        const response = await httpTestServer.request('GET', '/api/organizations/1234/memberships');

        // then
        expect(response.result.data[0].type).to.equal('memberships');
        expect(response.result.data[0].id).to.equal(membership.id.toString());
      });

      it('should return a JSON:API response including organization, organization role & user information', async () => {
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

  describe('#findOrganizationsStudentsWithUserInfo', () => {

    beforeEach(() => {
      securityPreHandlers.checkUserBelongsToOrganizationManagingStudents.returns(true);
    });

    context('Success cases', () => {

      const studentWithUserInfo = domainBuilder.buildUserWithSchoolingRegistration();

      it('should return an HTTP response with status code 200', async () => {
        // given
        usecases.findPaginatedFilteredSchoolingRegistrations.resolves({ data: [studentWithUserInfo] });

        // when
        const response = await httpTestServer.request('GET', '/api/organizations/1234/students');

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should return an HTTP response formatted as JSON:API', async () => {
        // given
        usecases.findPaginatedFilteredSchoolingRegistrations.resolves({ data: [studentWithUserInfo] });

        // when
        const response = await httpTestServer.request('GET', '/api/organizations/1234/students');

        // then
        expect(response.result.data[0].type).to.equal('students');
      });
    });

    context('Error cases', () => {

      context('when user is not allowed to access resource', () => {

        beforeEach(() => {
          securityPreHandlers.checkUserBelongsToOrganizationManagingStudents.callsFake((request, h) => {
            return Promise.resolve(h.response().code(403).takeover());
          });
        });

        it('should resolve a 403 HTTP response', async () => {
          // when
          const response = await httpTestServer.request('GET', '/api/organizations/1234/students');

          // then
          expect(response.statusCode).to.equal(403);
        });
      });
    });
  });

  describe('#sendInvitations', () => {

    context('Success cases', () => {

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

      beforeEach(() => {
        securityPreHandlers.checkUserIsAdminInOrganizationOrHasRolePixMaster.returns(true);
      });

      it('should return an HTTP response with status code 201', async () => {
        // given
        usecases.createOrganizationInvitations.resolves([invitation]);

        // when
        const response = await httpTestServer.request('POST', '/api/organizations/1/invitations', payload);

        // then
        expect(response.statusCode).to.equal(201);
      });

      it('should return the created invitation with status pending', async () => {
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

  describe('#findPendingInvitations', () => {

    context('Success cases', () => {

      const invitation = domainBuilder.buildOrganizationInvitation({
        organizationId: 1,
        status: OrganizationInvitation.StatusType.PENDING,
      });

      beforeEach(() => {
        securityPreHandlers.checkUserIsAdminInOrganization.returns(true);
      });

      it('should return an HTTP response with status code 200', async () => {
        // given
        usecases.findPendingOrganizationInvitations.resolves([invitation]);

        // when
        const response = await httpTestServer.request('GET', '/api/organizations/1/invitations');

        // then
        expect(response.statusCode).to.equal(200);
      });
    });
  });

  describe('#attachTargetProfilesToOrganization', () => {

    const payload = {
      data: {
        type: 'target-profiles-shares',
        attributes: {
          'target-profiles-to-attach': [1, 2],
        },
      },
    };

    context('Error cases', () => {

      context('when user is not Pix Master', () => {

        beforeEach(() => {
          securityPreHandlers.checkUserHasRolePixMaster.callsFake((request, h) => {
            return Promise.resolve(h.response().code(403).takeover());
          });
        });

        it('should return a 403 HTTP response', async () => {
          // when
          const response = await httpTestServer.request('POST', '/api/organizations/1234/target-profiles', payload);
          // then
          expect(response.statusCode).to.equal(403);
        });
      });

      context('when target-profile-id does not contain only numbers', () => {

        beforeEach(() => {
          securityPreHandlers.checkUserHasRolePixMaster.callsFake((request, h) => h.response(true));
        });

        it('should return a 404 HTTP response', async () => {
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
