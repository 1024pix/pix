export class CertificationCompanionLiveAlert {
  constructor({ assessmentId, status }) {
    this.assessmentId = assessmentId;
    this.status = status;
  }
}
/**
 * Companion live alert statuses.
 * @readonly
 * @enum {string}
 */
export const CertificationCompanionLiveAlertStatus = Object.freeze({
  /**
   * Ongoing alert for missing extension.
   */
  ONGOING: 'ONGOING',

  /**
   * Invigilator has confirmed extension is active.
   */
  CLEARED: 'CLEARED',
});
