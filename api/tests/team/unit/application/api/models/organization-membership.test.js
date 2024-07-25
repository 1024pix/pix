import { roles } from '../../../../../../src/shared/domain/models/Membership.js';
import { OrganizationMembership } from '../../../../../../src/team/application/api/models/organization-membership.js';
import { expect } from '../../../../../test-helper.js';

describe('Team | Unit | Application | API | Model | OrganizationMembership', function () {
  describe('#isMember', function () {
    it('instantiates a OrganizationMembership from a user with member role', function () {
      // given
      const organizationRole = roles.MEMBER;

      // when
      const membership = new OrganizationMembership(organizationRole);

      // then
      expect(membership.isMember).to.be.equal(true);
    });

    it('instantiates a OrganizationMembership from a user with not member role', function () {
      // given
      const organizationRole = roles.ADMIN;

      // when
      const membership = new OrganizationMembership(organizationRole);

      // then
      expect(membership.isMember).to.be.equal(false);
    });
  });

  describe('#isAdmin', function () {
    it('instantiates a OrganizationMembership from a user with admin role', function () {
      // given
      const organizationRole = roles.ADMIN;

      // when
      const membership = new OrganizationMembership(organizationRole);

      // then
      expect(membership.isAdmin).to.be.equal(true);
    });

    it('instantiates a OrganizationMembership from a user with not admin role', function () {
      // given
      const organizationRole = roles.MEMBER;

      // when
      const membership = new OrganizationMembership(organizationRole);

      // then
      expect(membership.isAdmin).to.be.equal(false);
    });
  });
});
