import { assertNotNullOrUndefined } from '../../../src/shared/domain/models/asserts.js';

export default class CertificationRescoredByScript {
  /**
   * @param {Object} params
   * @param {number} params.certificationCourseId - certification course that will be rescored
   */
  constructor({ certificationCourseId }) {
    assertNotNullOrUndefined(certificationCourseId);
    this.certificationCourseId = certificationCourseId;
  }
}
