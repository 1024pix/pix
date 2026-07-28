import { InvalidMembershipOrganizationRoleError } from '../errors.js';

const roles = {
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
};

class Membership {
  constructor({
    id,
    organizationRole = roles.MEMBER,
    updatedByUserId,
    organizationId,
    organization,
    userId,
    user,
    lastAccessedAt,
    disabledAt,
  } = {}) {
    this.id = id;
    this.organizationRole = organizationRole;
    this.updatedByUserId = updatedByUserId;
    this.organization = organization;
    this.organizationId = organization?.id ?? organizationId;
    this.user = user;
    this.userId = user?.id ?? userId;
    this.lastAccessedAt = lastAccessedAt;
    this.disabledAt = disabledAt;
  }

  get isAdmin() {
    return this.organizationRole === roles.ADMIN;
  }

  validateRole() {
    const isRoleValid = Object.values(roles).includes(this.organizationRole);
    if (!isRoleValid) {
      throw new InvalidMembershipOrganizationRoleError();
    }
  }
}

Membership.roles = roles;

export { Membership, roles };
