const { expect, sinon } = require('../../../test-helper');
const createMembership = require('../../../../lib/domain/usecases/create-membership');

describe('Unit | UseCase | create-membership', () => {

  it('should insert a new membership', async () => {
    // given
    const membershipRepository = { create: sinon.stub() };
    const userId = 1;
    const organizationId = 2;
    const DEFAULT_ORGANIZATION_ROLE_ADMIN_ID = 1;

    // when
    await createMembership({ membershipRepository, userId, organizationId });

    // then
    expect(membershipRepository.create).to.has.been.calledWithExactly(userId, organizationId, DEFAULT_ORGANIZATION_ROLE_ADMIN_ID);
  });
});
