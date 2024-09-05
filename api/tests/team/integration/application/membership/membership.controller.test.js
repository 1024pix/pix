import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { InvalidMembershipOrganizationRoleError } from '../../../../../src/shared/domain/errors.js';
import { Membership } from '../../../../../src/shared/domain/models/index.js';
import { teamRoutes } from '../../../../../src/team/application/routes.js';
import { usecases } from '../../../../../src/team/domain/usecases/index.js';
import { domainBuilder, expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Integration | Team | Application | Memberships | membership-controller', function () {
  let httpTestServer;

  beforeEach(async function () {
    sinon.stub(usecases, 'createMembership');
    sinon.stub(usecases, 'updateMembership');
    sinon.stub(usecases, 'createCertificationCenterMembershipForScoOrganizationAdminMember');
    sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf');
    sinon.stub(securityPreHandlers, 'checkUserIsAdminInOrganization');
    httpTestServer = new HttpTestServer();
    await httpTestServer.register(teamRoutes);
  });

  describe('#create', function () {
    const payload = {
      data: {
        type: 'memberships',
        relationships: {
          user: { data: { type: 'users', id: 1 } },
          organization: { data: { type: 'organizations', id: 1 } },
        },
      },
    };

    context('Success cases', function () {
      context('when a certification center membership is created', function () {
        it('should resolve a 201 HTTP response', async function () {
          // given
          const membership = domainBuilder.buildMembership();
          const certificationCenterMembership = domainBuilder.buildCertificationCenterMembership();

          usecases.createMembership.resolves(membership);
          usecases.createCertificationCenterMembershipForScoOrganizationAdminMember
            .withArgs({ membership })
            .resolves(certificationCenterMembership);

          securityPreHandlers.hasAtLeastOneAccessOf.returns(() => true);

          // when
          const response = await httpTestServer.request('POST', '/api/admin/memberships', payload);

          // then
          expect(response.statusCode).to.equal(201);
        });
      });

      context('when no certification center membership is created', function () {
        it('should resolve a 201 HTTP response', async function () {
          // given
          const membership = domainBuilder.buildMembership();

          usecases.createMembership.resolves(membership);
          usecases.createCertificationCenterMembershipForScoOrganizationAdminMember
            .withArgs({ membership })
            .resolves(undefined);

          securityPreHandlers.hasAtLeastOneAccessOf.returns(() => true);

          // when
          const response = await httpTestServer.request('POST', '/api/admin/memberships', payload);

          // then
          expect(response.statusCode).to.equal(201);
        });
      });

      it('should return a JSON API organization membership', async function () {
        // given
        const membership = domainBuilder.buildMembership();
        usecases.createMembership.resolves(membership);

        securityPreHandlers.hasAtLeastOneAccessOf.returns(() => true);

        // when
        const response = await httpTestServer.request('POST', '/api/admin/memberships', payload);

        // then
        expect(response.result.data.type).to.equal('organization-memberships');
      });
    });

    context('Error cases', function () {
      context('when user is not allowed to access resource', function () {
        it('should resolve a 403 HTTP response', async function () {
          // given
          securityPreHandlers.hasAtLeastOneAccessOf.returns((request, h) => h.response().code(403).takeover());

          // when
          const response = await httpTestServer.request('POST', '/api/admin/memberships', payload);

          // then
          expect(response.statusCode).to.equal(403);
        });
      });
    });
  });

  describe('#update', function () {
    context('Success cases', function () {
      context('when a certification center membership is created', function () {
        it('should return a 200 HTTP response', async function () {
          // given
          const membership = new Membership({
            id: 123,
            organizationRole: Membership.roles.ADMIN,
            updatedByUserId: null,
          });
          const updatedMembership = domainBuilder.buildMembership({
            organizationRole: Membership.roles.MEMBER,
          });
          const certificationCenterMembership = domainBuilder.buildCertificationCenterMembership();

          usecases.updateMembership.withArgs({ membership }).resolves(updatedMembership);
          usecases.createCertificationCenterMembershipForScoOrganizationAdminMember
            .withArgs({ membership })
            .resolves(certificationCenterMembership);
          securityPreHandlers.checkUserIsAdminInOrganization.returns(true);

          // when
          const payload = {
            data: {
              type: 'memberships',
              id: 123,
              attributes: {
                'organization-role': Membership.roles.ADMIN,
              },
              relationships: {
                organization: {
                  data: {
                    id: '1',
                    type: 'organizations',
                  },
                },
              },
            },
          };
          const response = await httpTestServer.request('PATCH', `/api/memberships/${membership.id}`, payload);

          // then
          expect(response.statusCode).to.equal(200);
        });
      });

      context('when no certification center membership is created', function () {
        it('should return a 200 HTTP response', async function () {
          // given
          const membership = new Membership({
            id: 123,
            organizationRole: Membership.roles.ADMIN,
            updatedByUserId: null,
          });
          const updatedMembership = domainBuilder.buildMembership({
            organizationRole: Membership.roles.MEMBER,
          });
          usecases.updateMembership.withArgs({ membership }).resolves(updatedMembership);
          usecases.createCertificationCenterMembershipForScoOrganizationAdminMember
            .withArgs({ membership })
            .resolves(undefined);
          securityPreHandlers.checkUserIsAdminInOrganization.callsFake((request, h) => h.response(true));

          // when
          const payload = {
            data: {
              type: 'memberships',
              id: 123,
              attributes: {
                'organization-role': Membership.roles.ADMIN,
              },
              relationships: {
                organization: {
                  data: {
                    id: '1',
                    type: 'organizations',
                  },
                },
              },
            },
          };
          const response = await httpTestServer.request('PATCH', `/api/memberships/${membership.id}`, payload);

          // then
          expect(response.statusCode).to.equal(200);
        });
      });
    });

    context('Error cases', function () {
      context('when request is not valid', function () {
        it('should resolve a 400 HTTP response', async function () {
          // given
          securityPreHandlers.checkUserIsAdminInOrganization.callsFake((request, h) => h.response(true));
          const idGivenInRequestParams = 1;
          const idGivenInPayload = 44;

          const membership = new Membership({
            id: idGivenInPayload,
            organizationRole: Membership.roles.ADMIN,
            updatedByUserId: null,
          });
          const updatedMembership = domainBuilder.buildMembership({
            organizationRole: Membership.roles.ADMIN,
          });
          usecases.updateMembership.withArgs({ membership }).resolves(updatedMembership);

          // when
          const payload = {
            data: {
              type: 'memberships',
              id: idGivenInPayload,
              attributes: {
                'organization-role': Membership.roles.ADMIN,
              },
              relationships: {
                organization: {
                  data: {
                    id: '1',
                    type: 'organizations',
                  },
                },
              },
            },
          };
          const response = await httpTestServer.request('PATCH', `/api/memberships/${idGivenInRequestParams}`, payload);

          // then
          expect(response.statusCode).to.equal(400);
        });
      });

      context('when organization role is not valid', function () {
        it('should resolve a 400 HTTP response', async function () {
          // given
          securityPreHandlers.checkUserIsAdminInOrganization.callsFake((request, h) => h.response(true));
          usecases.updateMembership.throws(new InvalidMembershipOrganizationRoleError());

          // when
          const payload = {
            data: {
              type: 'memberships',
              attributes: {
                'organization-role': Membership.roles.ADMIN,
              },
              relationships: {
                organization: {
                  data: {
                    id: '1',
                    type: 'organizations',
                  },
                },
              },
            },
          };
          const response = await httpTestServer.request('PATCH', '/api/memberships/1', payload);

          // then
          expect(response.statusCode).to.equal(400);
        });
      });
    });
  });

  describe('#findPaginatedFilteredMemberships', function () {
    context('Success cases', function () {
      beforeEach(function () {
        sinon.stub(securityPreHandlers, 'checkUserBelongsToOrganization').returns(true);
      });

      it('returns an HTTP response with status code 200', async function () {
        // given
        const membership = domainBuilder.buildMembership();
        sinon
          .stub(usecases, 'findPaginatedFilteredOrganizationMemberships')
          .resolves({ models: [membership], pagination: {} });

        // when
        const response = await httpTestServer.request('GET', '/api/organizations/1234/memberships');

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('returns an HTTP response formatted as JSON:API', async function () {
        // given
        const membership = domainBuilder.buildMembership();
        sinon
          .stub(usecases, 'findPaginatedFilteredOrganizationMemberships')
          .resolves({ models: [membership], pagination: {} });

        // when
        const response = await httpTestServer.request('GET', '/api/organizations/1234/memberships');

        // then
        expect(response.result.data[0].type).to.equal('memberships');
        expect(response.result.data[0].id).to.equal(membership.id.toString());
      });

      it('returns a JSON:API response including organization, organization role & user information', async function () {
        // given
        const membership = domainBuilder.buildMembership();
        sinon
          .stub(usecases, 'findPaginatedFilteredOrganizationMemberships')
          .resolves({ models: [membership], pagination: {} });

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
});
