import { MembershipNotFound } from '../../../../../src/team/domain/errors.js';
import { getOrganizationMembership } from '../../../../../src/team/domain/usecases/get-organization-membership.js';
import { catchErr, expect, sinon } from '../../../../test-helper.js';

describe('Team | Unit | Domain | Usecases | getOrganizationMembership', function () {
  describe('when the member does not exists', function () {
    it('throws a MembershipNotFound error', async function () {
      const membershipRepository = { findByUserIdAndOrganizationId: sinon.stub().resolves([]) };

      const error = await catchErr(getOrganizationMembership)({
        userId: 'foo',
        organizationId: 'bar',
        membershipRepository,
      });

      expect(error).to.be.instanceOf(MembershipNotFound);
    });
  });
});
