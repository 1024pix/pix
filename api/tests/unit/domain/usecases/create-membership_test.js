const { expect, sinon } = require('../../../test-helper');
const createMembership = require('../../../../lib/domain/usecases/create-membership');
const Membership = require('../../../../lib/domain/models/Membership');

describe('Unit | UseCase | create-membership', () => {

  it('should insert a new membership with role OWNER', async () => {
    // given
    const membershipRepository = {
      create: sinon.stub(),
      findByOrganizationId: sinon.stub().resolves([]),
    };
    const userId = 1;
    const organizationId = 2;
    const role = Membership.roles.OWNER;

    // when
    await createMembership({ membershipRepository, userId, organizationId });

    // then
    expect(membershipRepository.create).to.has.been.calledWithExactly(userId, organizationId, role);
  });

  it('should insert a new membership with role MEMBER', async () => {
    // given
    const membershipRepository = {
      create: sinon.stub(),
      findByOrganizationId: sinon.stub().resolves([{}]),
    };
    const userId = 1;
    const organizationId = 2;
    const role = Membership.roles.MEMBER;

    // when
    await createMembership({ membershipRepository, userId, organizationId });

    // then
    expect(membershipRepository.create).to.has.been.calledWithExactly(userId, organizationId, role);
  });
});
