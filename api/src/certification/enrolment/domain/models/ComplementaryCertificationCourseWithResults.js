/**
 * @typedef {('PIX'|'EXTERNAL')} Source
 *
 * @typedef {Object} Results
 * @property {number} id The id of the complementary certification badge for this result
 * @property {number} complementaryCertificationBadgeId The id of the complementary certification badge for this result
 * @property {number} level The level for this result
 * @property {Source} source
 */

import { _ } from '../../../../shared/infrastructure/utils/lodash-utils.js';
import { sources } from '../../../shared/domain/models/ComplementaryCertificationCourseResult.js';

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
}

export { ComplementaryCertificationCourseWithResults };
