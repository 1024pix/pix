/**
 * @typedef {('PIX'|'EXTERNAL')} Source
 *
 * @typedef {Object} Results
 * @property {number} id The id of the complementary certification badge for this result
 * @property {number} complementaryCertificationBadgeId The id of the complementary certification badge for this result
 * @property {number} level The level for this result
 * @property {Source} source
 */

import { sources } from '../../../certification/shared/domain/models/ComplementaryCertificationCourseResult.js';
import { _ } from '../../infrastructure/utils/lodash-utils.js';

class ComplementaryCertificationCourseWithResults {
  /**
   * @param {Object} params
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

  isAcquired() {
    if (this.#isUncompleted()) {
      return false;
    }
    return this.results.every(({ acquired }) => acquired);
  }

  isAcquiredByPixSource() {
    return this.results.some(({ source, acquired }) => source === sources.PIX && acquired);
  }

  isAcquiredExpectedLevelByPixSource() {
    return _.some(this.results, {
      source: sources.PIX,
      acquired: true,
      complementaryCertificationBadgeId: this.complementaryCertificationBadgeId,
    });
  }

  /**
   * @param {Object} params
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

  #isUncompleted() {
    return this.results.length === 0 || (this.hasExternalJury && this.results.length < 2);
  }
}

export { ComplementaryCertificationCourseWithResults };
