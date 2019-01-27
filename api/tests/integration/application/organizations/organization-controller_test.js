const { expect, sinon, domainBuilder, HttpTestServer } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const securityController = require('../../../../lib/interfaces/controllers/security-controller');
const { NotFoundError } = require('../../../../lib/domain/errors');
const moduleUnderTest = require('../../../../lib/application/organizations');

describe('Integration | Application | Organizations | organization-controller', () => {

  const organization = domainBuilder.buildOrganization();

  let httpTestServer;

  beforeEach(() => {
    sinon.stub(usecases, 'updateOrganizationInformation');
    sinon.stub(usecases, 'getOrganizationMemberships');
    sinon.stub(securityController, 'checkUserHasRolePixMaster');
    httpTestServer = new HttpTestServer(moduleUnderTest);
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

        context('when user is allowed to access resource', () => {

          beforeEach(() => {
            securityController.checkUserHasRolePixMaster.callsFake((request, h) => h.response(true));
          });

          it('should resolve a 404 HTTP response when organization does not exist', async () => {
            // given
            const error = new NotFoundError('Organization not found');
            usecases.updateOrganizationInformation.rejects(error);

            // when
            const response = await httpTestServer.request('PATCH', '/api/organizations/1234', payload);

            // then
            expect(response.statusCode).to.equal(404);
          });

          it('should resolve a 500 HTTP response when an unexpected exception occurred', async () => {
            // given
            usecases.updateOrganizationInformation.rejects(new Error());

            // when
            const response = await httpTestServer.request('PATCH', '/api/organizations/1234', payload);

            // then
            expect(response.statusCode).to.equal(500);
            expect(response.result.errors[0].code).to.equal('500');
          });
        });
      });
    });
  });

  describe('#getOrganizationMemberships', () => {

    context('Success cases', () => {

      const membership = domainBuilder.buildMembership();

      beforeEach(() => {
        securityController.checkUserHasRolePixMaster.callsFake((request, h) => h.response(true));
      });

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
        expect(response.result.data[0].id).to.equal(membership.id);
      });

      it('should return a JSON:API response including organization, organization role & user information', async () => {
        // given
        usecases.getOrganizationMemberships.resolves([membership]);

        // when
        const response = await httpTestServer.request('GET', '/api/organizations/1234/memberships');

        // then
        expect(response.result.included[0].type).to.equal('organizations');
        expect(response.result.included[0].id).to.equal(`${membership.organization.id}`);
        expect(response.result.included[1].type).to.equal('organizationRoles');
        expect(response.result.included[1].id).to.equal(`${membership.organizationRole.id}`);
        expect(response.result.included[2].type).to.equal('users');
        expect(response.result.included[2].id).to.equal(`${membership.user.id}`);
      });
    });

    context('Error cases', () => {

      it('should resolve a 500 HTTP response when an unexpected exception occurred', async () => {
        // given
        usecases.getOrganizationMemberships.rejects(new Error());

        // when
        const response = await httpTestServer.request('GET', '/api/organizations/1234/memberships');

        // then
        expect(response.statusCode).to.equal(500);
        expect(response.result.errors[0].code).to.equal('500');
      });
    });
  });
});
