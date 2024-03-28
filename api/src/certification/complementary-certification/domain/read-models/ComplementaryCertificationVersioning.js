import { assertInstanceOf, assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';

export class ComplementaryCertificationVersioning {
  /**
   * @param {Object} params
   * @param {number} params.complementaryCertificationId - complementary certification identifier
   * @param {Array<ComplementaryCertificationBadge>} params.complementaryCertificationBadges - complementary certification badges array
   */
  constructor({ complementaryCertificationId, complementaryCertificationBadges = [] }) {
    assertNotNullOrUndefined(complementaryCertificationId);
    complementaryCertificationBadges.forEach((badge) => assertInstanceOf(badge, ComplementaryCertificationBadge));

    this.complementaryCertificationId = complementaryCertificationId;
    this.complementaryCertificationBadges = complementaryCertificationBadges;
  }
}

export class ComplementaryCertificationBadge {
  /**
   * @param {Object} params
   * @param {number} params.id - complementary certification badge identifier
   * @param {Date} [params.deactivationDate] - empty if the badge is currently active
   */
  constructor({ id, deactivationDate }) {
    assertNotNullOrUndefined(id);
    this.id = id;

    if (deactivationDate) {
      assertInstanceOf(deactivationDate, Date);
      this.deactivationDate = deactivationDate;
    }
  }
}
