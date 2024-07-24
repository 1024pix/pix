import * as moduleUnderTest from '../../../../lib/application/memberships/index.js';
import { InvalidMembershipOrganizationRoleError } from '../../../../lib/domain/errors.js';
import { Membership } from '../../../../lib/domain/models/Membership.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';
import { securityPreHandlers } from '../../../../src/shared/application/security-pre-handlers.js';
import { usecases as srcUsecases } from '../../../../src/team/domain/usecases/index.js';
import { domainBuilder, expect, HttpTestServer, sinon } from '../../../test-helper.js';

describe('Integration | Application | Memberships | membership-controller', function () {
  let httpTestServer;

  beforeEach(async function () {
    sinon.stub(srcUsecases, 'createMembership');
    sinon.stub(usecases, 'updateMembership');
    sinon.stub(srcUsecases, 'createCertificationCenterMembershipForScoOrganizationAdminMember');
    sinon.stub(usecases, 'disableMembership');
    sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf');
    sinon.stub(securityPreHandlers, 'checkUserIsAdminInOrganization');
    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
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
          srcUsecases.createCertificationCenterMembershipForScoOrganizationAdminMember
            .withArgs({ membership })
            .resolves(certificationCenterMembership);
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
          srcUsecases.createCertificationCenterMembershipForScoOrganizationAdminMember
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

  describe('#disable', function () {
    it('should return a 204 HTTP response', async function () {
      // given
      const membershipId = domainBuilder.buildMembership().id;
      usecases.disableMembership.resolves();
      securityPreHandlers.checkUserIsAdminInOrganization.callsFake((request, h) => h.response(true));

      // when
      const response = await httpTestServer.request('POST', `/api/memberships/${membershipId}/disable`);

      // then
      expect(response.statusCode).to.equal(204);
    });
  });
});
