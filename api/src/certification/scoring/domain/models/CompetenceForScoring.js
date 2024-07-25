import { CompetenceMark } from '../../../../shared/domain/models/index.js';

/**
 * @typedef Interval
 * @type {object}
 * @property competenceLevel {number} - the level of the competence
 * @property bounds {Bounds} - the boundaries of the interval
 */

/**
 * @typedef Bounds
 * @type {object}
 * @property min {number} - the minimum value of the interval
 * @property max {number} - the maximum value of the interval
 */

export class CompetenceForScoring {
  /**
   * @param competenceId {string}
   * @param areaCode {string}
   * @param competenceCode {string}
   * @param intervals {Interval[]} - the capacity boundaries for each level
   */
  constructor({ competenceId, areaCode, competenceCode, intervals }) {
    this.competenceId = competenceId;
    this.areaCode = areaCode;
    this.competenceCode = competenceCode;
    this.intervals = this._extendExtremeIntervals(intervals);
  }

  getCompetenceMark(estimatedLevel) {
    const level = this._findInterval(estimatedLevel)?.competenceLevel;

    return new CompetenceMark({
      competenceId: this.competenceId,
      area_code: this.areaCode,
      competence_code: this.competenceCode,
      level,
      score: 0,
    });
  }

  _extendExtremeIntervals(intervals) {
    const maximumCapacity = Math.max(...intervals.map(({ bounds }) => bounds.max));
    const minimumCapacity = Math.min(...intervals.map(({ bounds }) => bounds.min));
    return intervals
      .map((interval) => {
        if (interval.bounds.max !== maximumCapacity) {
          return interval;
        }

        return {
          ...interval,
          bounds: {
            ...interval.bounds,
            max: Number.MAX_SAFE_INTEGER,
          },
        };
      })
      .map((interval) => {
        if (interval.bounds.min !== minimumCapacity) {
          return interval;
        }

        return {
          ...interval,
          bounds: {
            ...interval.bounds,
            min: Number.MIN_SAFE_INTEGER,
          },
        };
      });
  }

  _findInterval(estimatedLevel) {
    return this.intervals.find(({ bounds }) => bounds.min <= estimatedLevel && estimatedLevel < bounds.max);
  }
}
