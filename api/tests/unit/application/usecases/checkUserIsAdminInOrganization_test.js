import { expect, sinon, domainBuilder } from '../../../test-helper';
import useCase from '../../../../lib/application/usecases/checkUserIsAdminInOrganization';
import membershipRepository from '../../../../lib/infrastructure/repositories/membership-repository';
import Membership from '../../../../lib/domain/models/Membership';

describe('Unit | Application | Use Case | CheckUserIsAdminInOrganization', function () {
  beforeEach(function () {
    membershipRepository.findByUserIdAndOrganizationId = sinon.stub();
  });

  context('When user is admin in organization', function () {
    it('should return true', async function () {
      // given
      const userId = 1234;
      const organizationId = 789;

      const membership = domainBuilder.buildMembership({ organizationRole: Membership.roles.ADMIN });
      membershipRepository.findByUserIdAndOrganizationId.resolves([membership]);

      // when
      const response = await useCase.execute(userId, organizationId);

      // then
      expect(response).to.equal(true);
    });

    it('should return true with several memberships', async function () {
      // given
      const userId = 1234;
      const organizationId = 789;

      const membershipAdmin = domainBuilder.buildMembership({ organizationRole: Membership.roles.ADMIN });
      const membershipMember = domainBuilder.buildMembership({ organizationRole: Membership.roles.MEMBER });
      membershipRepository.findByUserIdAndOrganizationId.resolves([membershipAdmin, membershipMember]);

      // when
      const response = await useCase.execute(userId, organizationId);

      // then
      expect(response).to.equal(true);
    });
  });

  context('When user is not admin in organization', function () {
    it('should return false', async function () {
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
