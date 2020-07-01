const { catchErr, expect, sinon } = require('../../../test-helper');
const { disableMembership } = require('../../../../lib/domain/usecases');
const membershipRepository = require('../../../../lib/infrastructure/repositories/membership-repository');
const { MembershipUpdateError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | disable-membership', () => {

  beforeEach(() => {
    sinon.stub(membershipRepository, 'updateById');
  });

  it('should disable membership', async () => {
    // given
    const membershipId = 100;
    const userId = 10;
    membershipRepository.updateById.resolves();

    // when
    await disableMembership({ membershipId, userId, membershipRepository });

    // then
    const expectedMembershipAttributes = {
      disabledAt: sinon.match.instanceOf(Date),
      updatedByUserId: userId
    };
    expect(membershipRepository.updateById).to.has.been.calledWithExactly({ id: membershipId, membershipAttributes: expectedMembershipAttributes });
  });

  it('should throw a MembershipUpdateError if membership does not exist', async () => {
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
