import { disableOwnOrganizationMembership } from '../../../../lib/domain/usecases/disable-own-organization-membership.js';
import { expect, sinon } from '../../../test-helper.js';

describe('Unit | UseCase | disable-own-membership', function () {
  let membershipRepository;
  let clock;
  const now = new Date('2023-08-01T11:15:00Z');

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    membershipRepository = {
      findByUserIdAndOrganizationId: sinon.stub(),
      updateById: sinon.stub(),
    };
  });

  afterEach(function () {
    clock.restore();
  });

  context('success', function () {
    it('disables membership', async function () {
      // given
      const membershipId = 1;
      const organizationId = 10;
      const userId = 100;
      membershipRepository.findByUserIdAndOrganizationId.resolves([{ id: membershipId }]);
      membershipRepository.updateById.resolves();

      // when
      await disableOwnOrganizationMembership({ organizationId, userId, membershipRepository });

      // then
      expect(membershipRepository.findByUserIdAndOrganizationId).to.have.been.calledWithExactly({
        organizationId,
        userId,
      });
      expect(membershipRepository.updateById).to.has.been.calledWithExactly({
        id: membershipId,
        membership: {
          disabledAt: now,
          updatedByUserId: userId,
        },
      });
    });
  });
});
