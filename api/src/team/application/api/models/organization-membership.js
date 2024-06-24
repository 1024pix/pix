import { roles } from '../../../../../lib/domain/models/Membership.js';

/**
 * @class
 * @classdesc Model representing a membership to an organization.
 */
export class OrganizationMembership {
  #organizationRole;

  /**
   * @param {('ADMIN'|'MEMBER')} organizationRole - role of the user in the organization.
   */
  constructor(organizationRole) {
    this.#organizationRole = organizationRole;
  }

  /**
   * Tells if the user is member of the organization.
   * @return {boolean}
   */
  get isMember() {
    return this.#organizationRole === roles.MEMBER;
  }

  /**
   * Tells if the user is admin of the organization.
   * @return {boolean}
   */
  get isAdmin() {
    return this.#organizationRole === roles.ADMIN;
  }
}
