import { User } from '../../../../src/identity-access-management/domain/models/User.js';
import { Organization } from '../../../../src/organizational-entities/domain/models/Organization.js';
import { Membership } from '../../../../src/shared/domain/models/Membership.js';

/*
 * /!\ We can not use standard entity builders because of bidirectional relationships (a.k.a. cyclic dependencies)
 */

function _buildUser() {
  return new User({
    id: 159,
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@example.net',
  });
}

function _buildOrganization() {
  return new Organization({
    id: 753,
    name: 'ACME',
    type: 'PRO',
    externalId: 'EXTID',
    isManagingStudents: false,
  });
}

const buildMembership = function ({
  id = 123,
  organization = _buildOrganization(),
  organizationRole = Membership.roles.MEMBER,
  user = _buildUser(),
} = {}) {
  const membership = new Membership({ id, organization, organizationRole, user });

  membership.user.memberships.push(membership);

  return membership;
};

export { buildMembership };
