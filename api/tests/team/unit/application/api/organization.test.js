import { Membership, roles } from '../../../../../src/shared/domain/models/Membership.js';
import { MembershipNotFound } from '../../../../../src/team/application/api/errors/MembershipNotFound.js';
import { getOrganizationMembership } from '../../../../../src/team/application/api/organization.js';
import * as DomainErrors from '../../../../../src/team/domain/errors.js';
import { catchErr, expect, sinon } from '../../../../test-helper.js';

describe('Team | Unit | Application | API | Organization', function () {
  describe('#getOrganizationMembership', function () {
    it('returns an organization membership', async function () {
      // given
      const dependencies = {
        getOrganizationMembership: sinon.stub().resolves(new Membership({ organizationRole: roles.MEMBER })),
      };

      // when
      const organizationMembership = await getOrganizationMembership({
        organizationId: 'foo',
        userId: 'bar',
        dependencies,
      });

      // then
      expect(organizationMembership.isMember).to.be.true;
    });

    it('throws an error when membership not found', async function () {
      // given
      const dependencies = {
        getOrganizationMembership: sinon.stub().rejects(new DomainErrors.MembershipNotFound()),
      };

      // when
      const error = await catchErr(getOrganizationMembership)({
        organizationId: 'foo',
        userId: 'bar',
        dependencies,
      });

      // then
      expect(error).to.be.instanceOf(MembershipNotFound);
    });
  });
});
