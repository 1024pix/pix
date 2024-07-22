import { disableMembership } from '../../../../lib/domain/usecases/disable-membership.js';
import { MembershipUpdateError } from '../../../../src/shared/domain/errors.js';
import { catchErr, expect, sinon } from '../../../test-helper.js';

describe('Unit | UseCase | disable-membership', function () {
  let membershipRepository;

  beforeEach(function () {
    membershipRepository = { updateById: sinon.stub() };
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
