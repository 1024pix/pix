const { expect, sinon, domainBuilder, HttpTestServer } = require('../../../test-helper');

const securityController = require('../../../../lib/interfaces/controllers/security-controller');
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
    sandbox.stub(usecases, 'getOrganizationMemberships');
    sandbox.stub(usecases, 'addOrganizationMembershipWithEmail');
    sandbox.stub(usecases, 'findOrganizationStudents');
    sandbox.stub(usecases, 'createOrganizationInvitation');
    sandbox.stub(usecases, 'acceptOrganizationInvitation');

    sandbox.stub(securityController, 'checkUserHasRolePixMaster');
    sandbox.stub(securityController, 'checkUserIsOwnerInOrganization');
    sandbox.stub(securityController, 'checkUserIsOwnerInOrganizationOrHasRolePixMaster');
    sandbox.stub(securityController, 'checkUserBelongsToScoOrganizationAndManagesStudents');
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
        }
      }
    };

    context('Success cases', () => {

      beforeEach(() => {
        securityController.checkUserHasRolePixMaster.callsFake((request, h) => h.response(true));
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

      context('when user is allowed to access resource', () => {

        beforeEach(() => {
          securityController.checkUserHasRolePixMaster.callsFake((request, h) => {
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

  describe('#getOrganizationMemberships', () => {

    context('Success cases', () => {

      beforeEach(() => {
        securityController.checkUserIsOwnerInOrganizationOrHasRolePixMaster.returns(true);
      });

      const membership = domainBuilder.buildMembership();

      it('should return an HTTP response with status code 200', async () => {
        // given
        usecases.getOrganizationMemberships.resolves([membership]);

        // when
        const response = await httpTestServer.request('GET', '/api/organizations/1234/memberships');

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should return an HTTP response formatted as JSON:API', async () => {
        // given
        usecases.getOrganizationMemberships.resolves([membership]);

        // when
        const response = await httpTestServer.request('GET', '/api/organizations/1234/memberships');

        // then
        expect(response.result.data[0].type).to.equal('memberships');
        expect(response.result.data[0].id).to.equal(membership.id.toString());
      });

      it('should return a JSON:API response including organization, organization role & user information', async () => {
        // given
        usecases.getOrganizationMemberships.resolves([membership]);

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

  describe('#findStudents', () => {

    beforeEach(() => {
      securityController.checkUserBelongsToScoOrganizationAndManagesStudents.returns(true);
    });

    context('Success cases', () => {

      const student = domainBuilder.buildStudent();

      it('should return an HTTP response with status code 200', async () => {
        // given
        usecases.findOrganizationStudents.resolves([student]);

        // when
        const response = await httpTestServer.request('GET', '/api/organizations/1234/students');

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should return an HTTP response formatted as JSON:API', async () => {
        // given
        usecases.findOrganizationStudents.resolves([student]);

        // when
        const response = await httpTestServer.request('GET', '/api/organizations/1234/students');

        // then
        expect(response.result.data[0].type).to.equal('students');
        expect(response.result.data[0].id).to.equal(student.id.toString());
      });
    });

    context('Error cases', () => {

      context('when user is not allowed to access resource', () => {

        beforeEach(() => {
          securityController.checkUserBelongsToScoOrganizationAndManagesStudents.callsFake((request, h) => {
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

  describe('#sendInvitation', () => {

    context('Success cases', () => {

      const invitation = domainBuilder.buildOrganizationInvitation();
      const acceptedInvitation = { ...invitation, status: OrganizationInvitation.StatusType.ACCEPTED };

      const payload = {
        data: {
          type: 'organization-invitations',
          attributes: {
            email: invitation.email
          },
        }
      };

      beforeEach(() => {
        securityController.checkUserIsOwnerInOrganization.returns(true);
      });

      it('should return an HTTP response with status code 201', async () => {
        // given
        usecases.createOrganizationInvitation.resolves(invitation);
        usecases.acceptOrganizationInvitation.resolves(acceptedInvitation);
        usecases.addOrganizationMembershipWithEmail.resolves({});

        // when
        const response = await httpTestServer.request('POST', '/api/organizations/1/invitations', payload);

        // then
        expect(response.statusCode).to.equal(201);
      });
    });
  });

});
