const { expect, sinon } = require('../../../test-helper');
const createMembership = require('../../../../lib/domain/usecases/create-membership');
const { roles } = require('../../../../lib/domain/models/Membership');

describe('Unit | UseCase | create-membership', () => {

  it('should insert the first membership as an ADMIN', async () => {
    // given
    const membershipRepository = {
      create: sinon.stub(),
      findByOrganizationId: sinon.stub().resolves([]),
    };

    const userId = 1;
    const organizationId = 2;

    // when
    await createMembership({ membershipRepository, userId, organizationId });

    // then
    expect(membershipRepository.create).to.has.been.calledWithExactly(userId, organizationId, roles.ADMIN);
  });

  it('should insert the second membership as a MEMBER', async () => {
    // given
    const membershipRepository = {
      create: sinon.stub(),
      findByOrganizationId: sinon.stub().resolves([{}]),
    };

    const userId = 1;
    const organizationId = 2;

    // when
    await createMembership({ membershipRepository, userId, organizationId });

    // then
    expect(membershipRepository.create).to.has.been.calledWithExactly(userId, organizationId, roles.MEMBER);
  });

});
