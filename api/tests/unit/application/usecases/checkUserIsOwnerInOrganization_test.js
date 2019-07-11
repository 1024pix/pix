const { expect, sinon, domainBuilder } = require('../../../test-helper');
const useCase = require('../../../../lib/application/usecases/checkUserIsOwnerInOrganization');
const membershipRepository = require('../../../../lib/infrastructure/repositories/membership-repository');
const Membership = require('../../../../lib/domain/models/Membership');

describe('Unit | Application | Use Case | CheckUserIsOwnerInOrganization', () => {

  beforeEach(() => {
    membershipRepository.findByUserIdAndOrganizationId = sinon.stub();
  });

  context('When user is owner in organization', () => {

    it('should return true', async () => {
      // given
      const userId = 1234;
      const organizationId = 789;

      const membership = domainBuilder.buildMembership({ organizationRole: Membership.roles.OWNER });
      membershipRepository.findByUserIdAndOrganizationId.resolves([membership]);

      // when
      const response = await useCase.execute(userId, organizationId);

      // then
      expect(response).to.equal(true);
    });

    it('should return true with several memberships', async () => {
      // given
      const userId = 1234;
      const organizationId = 789;

      const membershipOwner = domainBuilder.buildMembership({ organizationRole: Membership.roles.OWNER });
      const membershipMember = domainBuilder.buildMembership({ organizationRole: Membership.roles.MEMBER });
      membershipRepository.findByUserIdAndOrganizationId.resolves([membershipOwner, membershipMember]);

      // when
      const response = await useCase.execute(userId, organizationId);

      // then
      expect(response).to.equal(true);
    });
  });

  context('When user is not owner in organization', () => {

    it('should return false', async () => {
      // given
      const userId = 1234;
      const organizationId = 789;
      membershipRepository.findByUserIdAndOrganizationId.resolves([]);

      // when
      const response = await useCase.execute(userId, organizationId);

      // then
      expect(response).to.equal(false);
    });
  });
});
