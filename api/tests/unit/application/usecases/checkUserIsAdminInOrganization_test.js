const { expect, sinon, domainBuilder } = require('../../../test-helper');
const useCase = require('../../../../lib/application/usecases/checkUserIsAdminInOrganization');
const Membership = require('../../../../lib/domain/models/Membership');

describe('Unit | Application | Use Case | CheckUserIsAdminInOrganization', function () {
  let membershipRepositoryStub;

  beforeEach(function () {
    membershipRepositoryStub = {
      findByUserIdAndOrganizationId: sinon.stub(),
    };
  });

  context('When user is admin in organization', function () {
    it('should return true', async function () {
      // given
      const userId = 1234;
      const organizationId = 789;

      const membership = domainBuilder.buildMembership({ organizationRole: Membership.roles.ADMIN });
      membershipRepositoryStub.findByUserIdAndOrganizationId.resolves([membership]);

      // when
      const response = await useCase.execute(userId, organizationId, {
        membershipRepository: membershipRepositoryStub,
      });

      // then
      expect(response).to.equal(true);
    });

    it('should return true with several memberships', async function () {
      // given
      const userId = 1234;
      const organizationId = 789;

      const membershipAdmin = domainBuilder.buildMembership({ organizationRole: Membership.roles.ADMIN });
      const membershipMember = domainBuilder.buildMembership({ organizationRole: Membership.roles.MEMBER });
      membershipRepositoryStub.findByUserIdAndOrganizationId.resolves([membershipAdmin, membershipMember]);

      // when
      const response = await useCase.execute(userId, organizationId, {
        membershipRepository: membershipRepositoryStub,
      });

      // then
      expect(response).to.equal(true);
    });
  });

  context('When user is not admin in organization', function () {
    it('should return false', async function () {
      // given
      const userId = 1234;
      const organizationId = 789;
      membershipRepositoryStub.findByUserIdAndOrganizationId.resolves([]);

      // when
      const response = await useCase.execute(userId, organizationId, {
        membershipRepository: membershipRepositoryStub,
      });

      // then
      expect(response).to.equal(false);
    });
  });
});
