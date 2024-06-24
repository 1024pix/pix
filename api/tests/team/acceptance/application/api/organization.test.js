import { roles } from '../../../../../lib/domain/models/Membership.js';
import { getOrganizationMembership } from '../../../../../src/team/application/api/organization.js';
import { databaseBuilder, expect } from '../../../../test-helper.js';

describe('Team | Acceptance | Application | API | Organization', function () {
  describe('#getOrganizationMembership', function () {
    it('returns an organization membership', async function () {
      // given
      const { userId, organizationId } = databaseBuilder.factory.buildMembership({ organizationRole: roles.MEMBER });
      await databaseBuilder.commit();

      // when
      const organizationMembership = await getOrganizationMembership({ organizationId, userId });

      // then
      expect(organizationMembership.isMember).to.be.true;
    });
  });
});
