import sinon from 'sinon';

import { Membership } from '../../../../../src/shared/domain/models/Membership.js';
import { membershipController } from '../../../../../src/team/application/membership/membership.controller.js';
import { usecases } from '../../../../../src/team/domain/usecases/index.js';

import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

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
        headers: generateAuthenticatedUserRequestHeaders({ userId: userWhoUpdateMemberRole.id }),
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

      const updateMembership = sinon.stub(usecases, 'updateMembership');
      updateMembership
        .withArgs({
          membership,
        })
        .resolves(updatedMembership);
      sinon.stub(usecases, 'createCertificationCenterMembershipForScoOrganizationAdminMember').resolves();
      const membershipSerializer = { deserialize: sinon.stub(), serialize: sinon.stub() };
      membershipSerializer.deserialize.withArgs(request.payload).returns(membership);
      membershipSerializer.serialize.withArgs(updatedMembership).returns(serializedMembership);

      // when
      const result = await membershipController.update(request, hFake, { membershipSerializer });

      // then
      expect(usecases.updateMembership).to.have.been.calledOnce;
      expect(result.source).equal(serializedMembership);
    });

    it('should call createCertificationCenterMembershipForScoOrganizationAdminMember usecase', async function () {
      // given
      const user = domainBuilder.buildUser();
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
        headers: generateAuthenticatedUserRequestHeaders({ userId: 1234 }),
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

      const membershipSerializer = { deserialize: sinon.stub(), serialize: sinon.stub() };
      membershipSerializer.deserialize.withArgs(request.payload).returns(membership);
      sinon.stub(usecases, 'updateMembership').resolves(updatedMembership);
      sinon.stub(usecases, 'createCertificationCenterMembershipForScoOrganizationAdminMember').resolves();

      // when
      await membershipController.update(request, hFake, { membershipSerializer });

      // then
      expect(usecases.createCertificationCenterMembershipForScoOrganizationAdminMember).calledWith({
        membership,
      });
    });
  });
});
