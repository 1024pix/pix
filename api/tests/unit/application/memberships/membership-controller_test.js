import { membershipController } from '../../../../lib/application/memberships/membership-controller.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';
import { Membership } from '../../../../src/shared/domain/models/Membership.js';
import { usecases as srcUsecases } from '../../../../src/team/domain/usecases/index.js';
import { domainBuilder, expect, hFake, sinon } from '../../../test-helper.js';

describe('Unit | Controller | membership-controller', function () {
  describe('#update', function () {
    it('should return the serialized updated membership', async function () {
      // given
      const user = domainBuilder.buildUser();
      const userWhoUpdateMemberRole = domainBuilder.buildUser();
      const organization = domainBuilder.buildOrganization();
      const membership = domainBuilder.buildMembership({
        organizationRole: Membership.roles.MEMBER,
        organization,
        user,
      });
      const updatedMembership = domainBuilder.buildMembership({
        organizationRole: Membership.roles.ADMIN,
        organization,
        user,
      });
      const serializedMembership = Symbol('membership serialized');

      const request = {
        params: {
          id: membership.id,
        },
        payload: {
          data: {
            type: 'memberships',
            id: membership.id,
            attributes: {
              'organization-role': Membership.roles.ADMIN,
            },
            relationships: {
              organization: {
                data: {
                  id: organization.id.toString(),
                  type: 'organizations',
                },
              },
            },
          },
        },
      };

      const requestResponseUtils = { extractUserIdFromRequest: sinon.stub() };
      requestResponseUtils.extractUserIdFromRequest.returns(userWhoUpdateMemberRole.id);
      const updateMembershipUsecase = sinon.stub(usecases, 'updateMembership');
      updateMembershipUsecase
        .withArgs({
          membership,
        })
        .resolves(updatedMembership);
      sinon.stub(srcUsecases, 'createCertificationCenterMembershipForScoOrganizationAdminMember').resolves();
      const membershipSerializer = { deserialize: sinon.stub(), serialize: sinon.stub() };
      membershipSerializer.deserialize.withArgs(request.payload).returns(membership);
      membershipSerializer.serialize.withArgs(updatedMembership).returns(serializedMembership);

      // when
      const result = await membershipController.update(request, hFake, { requestResponseUtils, membershipSerializer });

      // then
      expect(usecases.updateMembership).to.have.been.calledOnce;
      expect(result.source).equal(serializedMembership);
    });

    it('should call createCertificationCenterMembershipForScoOrganizationAdminMember usecase', async function () {
      // given
      const user = domainBuilder.buildUser();
      const userWhoUpdateMemberRole = domainBuilder.buildUser();
      const organization = domainBuilder.buildOrganization();
      const membership = domainBuilder.buildMembership({
        organizationRole: Membership.roles.MEMBER,
        organization,
        user,
      });
      const updatedMembership = domainBuilder.buildMembership({
        organizationRole: Membership.roles.ADMIN,
        organization,
        user,
      });

      const request = {
        params: {
          id: membership.id,
        },
        payload: {
          data: {
            type: 'memberships',
            id: membership.id,
            attributes: {
              'organization-role': Membership.roles.ADMIN,
            },
            relationships: {
              organization: {
                data: {
                  id: organization.id.toString(),
                  type: 'organizations',
                },
              },
            },
          },
        },
      };
      const requestResponseUtils = { extractUserIdFromRequest: sinon.stub() };
      requestResponseUtils.extractUserIdFromRequest.returns(userWhoUpdateMemberRole.id);
      const membershipSerializer = { deserialize: sinon.stub(), serialize: sinon.stub() };
      membershipSerializer.deserialize.withArgs(request.payload).returns(membership);
      sinon.stub(usecases, 'updateMembership').resolves(updatedMembership);
      sinon.stub(srcUsecases, 'createCertificationCenterMembershipForScoOrganizationAdminMember').resolves();

      // when
      await membershipController.update(request, hFake, { requestResponseUtils, membershipSerializer });

      // then
      expect(srcUsecases.createCertificationCenterMembershipForScoOrganizationAdminMember).calledWith({
        membership,
      });
    });
  });
});
