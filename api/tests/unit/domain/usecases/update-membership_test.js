const { expect, sinon, catchErr } = require('../../../test-helper');
const { updateMembership } = require('../../../../lib/domain/usecases');
const Membership = require('../../../../lib/domain/models/Membership');
const { InvalidMembershipRoleError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | update-membership', () => {

  let membershipRepository;

  beforeEach(() => {
    membershipRepository = {
      updateById: sinon.stub().resolves(),
    };
  });

  context('when membership exists', () => {

    it('should update membership attributes', async () => {
      // given
      const membershipId = 100;
      const organizationRole = Membership.roles.ADMIN;
      const membership = new Membership({ id: membershipId, organizationRole, updatedByUserId: 12345 });

      // when
      await updateMembership({ membershipId, membership, membershipRepository });

      // then
      expect(membershipRepository.updateById).to.has.been.calledWith({ id: membershipId, membership });
    });

    it('should throw a InvalidMembershipRoleError if role is not valid', async () => {
      // given
      const membershipId = 100;
      const organizationRole = 'NOT_VALID_ROLE';
      const membership = new Membership({ id: membershipId, organizationRole, updatedByUserId: 12345 });

      // when
      const error = await catchErr(updateMembership)({ membershipId, membership, membershipRepository });

      // then
      expect(error).to.an.instanceOf(InvalidMembershipRoleError);
    });
  });
});
