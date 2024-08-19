import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';

export class CertificationRescoringByScriptJob {
  /**
   * @param {Object} params
   * @param {number} params.certificationCourseId - certification course that will be rescored
   */
  constructor({ certificationCourseId }) {
    assertNotNullOrUndefined(certificationCourseId);
    this.certificationCourseId = certificationCourseId;
  }
}
