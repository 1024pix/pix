export class SupervisedSession {
  constructor({ id, firstStartedCertificationId, date }) {
    this.id = id;
    this.firstStartedCertificationId = firstStartedCertificationId;
    this.date = date;
  }

  /**
   * @param {object} params
   * @param {number} params.certificationId
   * @param {string} params.timezone
   * @returns {boolean} true if session date has been updated, false otherwise
   */
  setStartDate({ certificationId, timezone }) {
    if (certificationId !== this.firstStartedCertificationId) {
      return false;
    }
    if (!timezone) {
      return false;
    }
    let hasDateChanged = false;
    try {
      this.date = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date());
      hasDateChanged = true;
    } catch {
      // Let the date as it is
    }
    return hasDateChanged;
  }
}
