import {
  Membership,
  UserMemberships,
} from '../../../../../../src/certification/shared/domain/read-models/UserMemberships.js';

/**
 * @typedef {import('../../../../../../src/certification/shared/domain/models/Scopes.js').SCOPES} SCOPES
 * @typedef {import('../../../../../../db/database-builder/database-builder.js').databaseBuilder} DatabaseBuilder
 */

/**
 * Fluent builder for the {@link UserMemberships} domain read-model.
 *
 * @example
 * const userMemberships = domainBuilder.certification.shared
 *   .userMembershipsBuilder()
 *   .withMembership({ certificationCenterId: 123, isDisabled: true })
 *   .withParameters({ userId: 4 })
 *   .insertToDB({ databaseBuilder });
 */
class UserMembershipsBuilder {
  constructor() {
    this.userId = null;
    this.membershipsData = [];
  }

  /**
   * Adds a membership
   *
   * @param {object} params
   * @param {number} params.certificationCenterId - explicit id; without it, insertToDB lets the database assign one and build() produces a non-persisted certification-center (id null)
   * @param {boolean} params.isDisabled
   * @returns {UserMembershipsBuilder}
   */
  addMembership({ certificationCenterId, isDisabled = false } = {}) {
    this.membershipsData.push({
      certificationCenterId: certificationCenterId ?? null,
      isDisabled,
    });
    return this;
  }

  /**
   * Overrides any subset of the UserMembershipsBuilder attributes carried by the builder.
   * Omitted parameters keep their current value, so the method can be called
   * several times in the same chain without resetting previous overrides.
   *
   * @param {object} [params]
   * @param {number} [params.userId] - explicit id; without it, insertToDB lets the database assign one and build() produces a non-persisted user (id null)
   * @returns {UserMembershipsBuilder}
   */
  withParameters({ userId } = {}) {
    this.userId = userId ?? this.userId;
    return this;
  }

  /**
   * Inserts corresponding user row and all the underlying necessary data
   * then returns the built domain UserMemberships carrying the persisted id.
   * Must be called before `await databaseBuilder.commit()`.
   *
   * @param {object} params
   * @param {DatabaseBuilder} params.databaseBuilder
   * @returns {UserMemberships} the persisted userMemberships
   */
  insertToDB({ databaseBuilder }) {
    const userMemberships = this.build();

    const userId = databaseBuilder.factory.buildUser({
      id: userMemberships.userId ?? undefined,
    }).id;
    userMemberships.userId = userId;

    for (const membership of userMemberships.memberships) {
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
        id: membership.certificationCenterId ?? undefined,
      }).id;
      membership.certificationCenterId = certificationCenterId;
      databaseBuilder.factory.buildCertificationCenterMembership({
        userId,
        certificationCenterId,
        disabledAt: membership.isDisabled ? new Date() : null,
      });
    }

    return userMemberships;
  }

  /**
   * Materializes the read-model UserMemberships without touching the database.
   *
   * @returns {UserMemberships}
   */
  build() {
    const memberships = this.membershipsData.map((data) => new Membership(data));
    return new UserMemberships({
      userId: this.userId,
      memberships,
    });
  }
}

/**
 * Entry point of the fluent UserMemberships builder. Returns the builder, NOT a UserMemberships:
 * Note: end the chain with build() for in-memory storage or insertToDB() for DB storage.
 *
 * @returns {UserMembershipsBuilder}
 */
export function userMembershipsBuilder() {
  return new UserMembershipsBuilder();
}
