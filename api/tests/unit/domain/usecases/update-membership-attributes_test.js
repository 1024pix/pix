const { expect, sinon } = require('../../../test-helper');
const { updateMembership } = require('../../../../lib/domain/usecases');
const Membership = require('../../../../lib/domain/models/Membership');

describe('Unit | UseCase | update-membership-attributes', () => {

  let membershipRepository;

  beforeEach(() => {
    membershipRepository = {
      updateById: sinon.stub().resolves()
    };
  });

  context('when membership exists', () => {

    it('should update membership attributes', async () => {
      // given
      const membershipId = 100;
      const organizationRole = Membership.roles.ADMIN;
      const membershipAttributes = { id: membershipId, organizationRole, updatedByUserId: 12345 };

      // when
      await updateMembership({ membershipId, membershipAttributes, membershipRepository });

      // then
      expect(membershipRepository.updateById).to.has.been.calledWith({ id: membershipId, membershipAttributes });
    });
  });
});
