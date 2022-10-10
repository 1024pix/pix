const { expect, sinon, hFake, domainBuilder } = require('../../../test-helper');

const membershipController = require('../../../../lib/application/memberships/membership-controller');
const usecases = require('../../../../lib/domain/usecases');
const membershipSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/membership-serializer');
const minimalMembershipSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/memberships/minimal-membership-serializer');
const Membership = require('../../../../lib/domain/models/Membership');
const requestResponseUtils = require('../../../../lib/infrastructure/utils/request-response-utils');

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

      sinon
        .stub(usecases, 'createMembership')
        .withArgs({ userId: user.id, organizationId: organization.id })
        .resolves(membership);
      sinon.stub(usecases, 'createCertificationCenterMembershipForScoOrganizationMember').resolves();
      sinon.stub(minimalMembershipSerializer, 'serialize').withArgs(membership).returns(serializedMembership);

      // when
      const result = await membershipController.create(request, hFake);

      // then
      expect(usecases.createMembership).to.have.been.calledOnce;
      expect(result.source).equal(serializedMembership);
    });

    it('should call createCertificationCenterMembershipForScoOrganizationMember usecase', async function () {
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

      sinon
        .stub(usecases, 'createMembership')
        .withArgs({ userId: user.id, organizationId: organization.id })
        .resolves(membership);
      sinon.stub(usecases, 'createCertificationCenterMembershipForScoOrganizationMember').resolves();

      // when
      await membershipController.create(request, hFake);

      // then
      expect(usecases.createCertificationCenterMembershipForScoOrganizationMember).calledWith({
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

      sinon.stub(requestResponseUtils, 'extractUserIdFromRequest').returns(userWhoUpdateMemberRole.id);
      sinon.stub(membershipSerializer, 'deserialize').withArgs(request.payload).returns(membership);
      sinon.stub(membershipSerializer, 'serialize').withArgs(updatedMembership).returns(serializedMembership);
      sinon
        .stub(usecases, 'updateMembership')
        .withArgs({
          membership,
        })
        .resolves(updatedMembership);
      sinon.stub(usecases, 'createCertificationCenterMembershipForScoOrganizationMember').resolves();

      // when
      const result = await membershipController.update(request, hFake);

      // then
      expect(usecases.updateMembership).to.have.been.calledOnce;
      expect(result.source).equal(serializedMembership);
    });

    it('should call createCertificationCenterMembershipForScoOrganizationMember usecase', async function () {
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

      sinon.stub(requestResponseUtils, 'extractUserIdFromRequest').returns(userWhoUpdateMemberRole.id);
      sinon.stub(membershipSerializer, 'deserialize').withArgs(request.payload).returns(membership);
      sinon.stub(usecases, 'updateMembership').resolves(updatedMembership);
      sinon.stub(usecases, 'createCertificationCenterMembershipForScoOrganizationMember').resolves();

      // when
      await membershipController.update(request, hFake);

      // then
      expect(usecases.createCertificationCenterMembershipForScoOrganizationMember).calledWith({
        membership,
      });
    });
  });
});
