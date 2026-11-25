import { OrganizationLearnerNotBelongToOrganizationIdentityError } from '../../../../identity-access-management/domain/errors.js';

export class OrganizationLearnerIdentities {
  /**
   *
   * @param {number} id
   * @param {boolean} hasScoGarIdentityProvider
   * @param {OrganizationLearnerIdentity[]} values
   */
  constructor({ id, hasScoGarIdentityProvider, values }) {
    this.id = id;
    this.hasScoGarIdentityProvider = hasScoGarIdentityProvider;
    this.values = values;

    this.#assertAllOrganizationLearnerIdentitiesBelongsToOrganization();
  }

  #assertAllOrganizationLearnerIdentitiesBelongsToOrganization() {
    const allOrganizationLearnerIdentitiesBelongsToOrganization = this.values.every(
      (organizationLearnerIdentity) => organizationLearnerIdentity.organizationId === this.id,
    );

    if (!allOrganizationLearnerIdentitiesBelongsToOrganization) {
      throw new OrganizationLearnerNotBelongToOrganizationIdentityError();
    }
  }
}
