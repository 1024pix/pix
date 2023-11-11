import { expect, sinon, hFake, domainBuilder } from '../../../test-helper.js';
import { membershipController } from '../../../../lib/application/memberships/membership-controller.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';
import { Membership } from '../../../../lib/domain/models/Membership.js';

describe('Unit | Controller | membership-controller', function () {
  describe('#create', function () {
    it('should return the serialized created membership', async function () {
      // given
      const user = domainBuilder.buildUser();
      const organization = domainBuilder.buildOrganization();
      const membership = domainBuilder.buildMembership({ organization, user });
      const serializedMembership = Symbol('membership serialized');

      const request = {
        payload: {
          data: {
            relationships: {
              user: { data: { id: user.id } },
              organization: { data: { id: organization.id } },
            },
          },
        },
      };

      const createMembershipUsecase = sinon.stub(usecases, 'createMembership');
      createMembershipUsecase.withArgs({ userId: user.id, organizationId: organization.id }).resolves(membership);
      sinon.stub(usecases, 'createCertificationCenterMembershipForScoOrganizationAdminMember').resolves();
      const membershipSerializer = { serializeForAdmin: sinon.stub() };
      membershipSerializer.serializeForAdmin.withArgs(membership).returns(serializedMembership);

      // when
      const result = await membershipController.create(request, hFake, { membershipSerializer });

      // then
      expect(usecases.createMembership).to.have.been.calledOnce;
      expect(result.source).equal(serializedMembership);
    });

    it('should call createCertificationCenterMembershipForScoOrganizationAdminMember usecase', async function () {
      // given
      const user = domainBuilder.buildUser();
      const organization = domainBuilder.buildOrganization();
      const membership = domainBuilder.buildMembership({ organization, user });

      const request = {
        payload: {
          data: {
            relationships: {
              user: { data: { id: user.id } },
              organization: { data: { id: organization.id } },
            },
          },
        },
      };

      const createMembershipUsecase = sinon.stub(usecases, 'createMembership');
      createMembershipUsecase.withArgs({ userId: user.id, organizationId: organization.id }).resolves(membership);
      sinon.stub(usecases, 'createCertificationCenterMembershipForScoOrganizationAdminMember').resolves();
      const membershipSerializer = { serializeForAdmin: sinon.stub() };
      membershipSerializer.serializeForAdmin.withArgs(membership).returns('ok');

      // when
      await membershipController.create(request, hFake, { membershipSerializer });

      // then
      expect(usecases.createCertificationCenterMembershipForScoOrganizationAdminMember).calledWith({
        membership,
      });
    });
  });

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
      sinon.stub(usecases, 'createCertificationCenterMembershipForScoOrganizationAdminMember').resolves();
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
      sinon.stub(usecases, 'createCertificationCenterMembershipForScoOrganizationAdminMember').resolves();

      // when
      await membershipController.update(request, hFake, { requestResponseUtils, membershipSerializer });

      // then
      expect(usecases.createCertificationCenterMembershipForScoOrganizationAdminMember).calledWith({
        membership,
      });
    });
  });
});
