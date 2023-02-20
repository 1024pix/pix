import { catchErr, expect, sinon } from '../../../test-helper';
import { disableMembership } from '../../../../lib/domain/usecases';
import membershipRepository from '../../../../lib/infrastructure/repositories/membership-repository';
import { MembershipUpdateError } from '../../../../lib/domain/errors';

describe('Unit | UseCase | disable-membership', function () {
  beforeEach(function () {
    sinon.stub(membershipRepository, 'updateById');
  });

  it('should disable membership', async function () {
    // given
    const membershipId = 100;
    const userId = 10;
    membershipRepository.updateById.resolves();

    // when
    await disableMembership({ membershipId, userId, membershipRepository });

    // then
    const expectedMembershipAttributes = {
      disabledAt: sinon.match.instanceOf(Date),
      updatedByUserId: userId,
    };
    expect(membershipRepository.updateById).to.has.been.calledWithExactly({
      id: membershipId,
      membership: expectedMembershipAttributes,
    });
  });

  it('should throw a MembershipUpdateError if membership does not exist', async function () {
    // given
    const membershipId = 99999999;
    const userId = 10;
    membershipRepository.updateById.throws(new MembershipUpdateError());

    // when
    const error = await catchErr(disableMembership)({ membershipId, userId, membershipRepository });

    // then
    expect(error).to.be.instanceOf(MembershipUpdateError);
  });
});
