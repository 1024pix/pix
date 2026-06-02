/**
 * @typedef {('PIX'|'EXTERNAL')} Source
 *
 * @typedef {object} Results
 * @property {number} id The id of the complementary certification badge for this result
 * @property {number} complementaryCertificationBadgeId The id of the complementary certification badge for this result
 * @property {number} level The level for this result
 * @property {Source} source
 */

import { ChallengesReferential } from '../../../shared/domain/models/ChallengesReferential.js';

class ComplementaryCertificationCourseWithResults {
  /**
   * @param {object} params
   * @param {number} params.id
   * @param {boolean} params.hasExternalJury
   * @param {Array<Results>} params.results
   * @param {number} params.complementaryCertificationBadgeId The id of the targeted complementary certification badge
   */
  constructor({ id, hasExternalJury = false, results, complementaryCertificationBadgeId }) {
    this.id = id;
    this.hasExternalJury = hasExternalJury;
    this.results = results;
    this.complementaryCertificationBadgeId = complementaryCertificationBadgeId;
  }

  isAcquiredExpectedLevelByPixSource() {
    return this.results?.some((r) => {
      return (
        r.source === ChallengesReferential.PIX &&
        r.acquired === true &&
        r.complementaryCertificationBadgeId === this.complementaryCertificationBadgeId
      );
    });
  }

  /**
   * @param {object} params
   * @param {number} params.id
   * @param {boolean} params.hasExternalJury
   * @param {Array<Results>} params.results
   * @param {number} params.complementaryCertificationBadgeId The id of the targeted complementary certification badge
   */
  static from({ id, hasExternalJury, results, complementaryCertificationBadgeId }) {
    return new ComplementaryCertificationCourseWithResults({
      id,
      hasExternalJury,
      results,
      complementaryCertificationBadgeId,
    });
  }
}

export { ComplementaryCertificationCourseWithResults };
