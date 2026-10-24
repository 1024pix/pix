import { assertNotNullOrUndefined } from '../../models/asserts.js';

export default class CertificationCancelled {
  /**
   * @param {Object} params
   * @param {number} params.certificationCourseId - certification course that will be rescored
   * @param {number} params.juryId - Id of the jury member who cancelled the certification
   */
  constructor({ certificationCourseId, juryId }) {
    assertNotNullOrUndefined(certificationCourseId);
    this.certificationCourseId = certificationCourseId;
    assertNotNullOrUndefined(juryId);
    this.juryId = juryId;
  }
}
