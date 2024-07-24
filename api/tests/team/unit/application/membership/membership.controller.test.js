import { membershipController } from '../../../../../src/team/application/membership/membership.controller.js';
import { usecases } from '../../../../../src/team/domain/usecases/index.js';
import { domainBuilder, expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Team | Application | Controller | Membership', function () {
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
});
