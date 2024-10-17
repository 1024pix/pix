export class CertificationCompanionLiveAlert {
  constructor({ id, assessmentId, status }) {
    this.id = id;
    this.assessmentId = assessmentId;
    this.status = status;
  }

  clear() {
    this.status = CertificationCompanionLiveAlertStatus.CLEARED;
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
