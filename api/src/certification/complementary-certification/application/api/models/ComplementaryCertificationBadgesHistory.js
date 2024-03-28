import { assertInstanceOf, assertNotNullOrUndefined } from '../../../../../shared/domain/models/asserts.js';

export class ComplementaryCertificationBadgesHistory {
  /**
   * @param {Object} params
   * @param {Array<number>} params.complementaryCertificationBadgeIds - complementary certification badge identifier
   * @param {Date} params.activationDate -  date when linked to a complementary certification badges
   * @param {Date} [params.deactivationDate]  - date when unlinked from complementary certification badges, can be undefined
   */
  constructor({ complementaryCertificationBadgeIds, activationDate, deactivationDate }) {
    assertNotNullOrUndefined(complementaryCertificationBadgeIds);

    assertInstanceOf(activationDate, Date);

    this.complementaryCertificationBadgeIds = complementaryCertificationBadgeIds;
    this.activationDate = activationDate;

    if (deactivationDate) {
      assertInstanceOf(deactivationDate, Date);
      this.deactivationDate = deactivationDate;
    }
  }
}
