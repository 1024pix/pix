export class Session {
  /**
   * @params {number} id
   * @params {string} date
   * @params {string} accessCode
   * @params {boolean} hasStarted
   * @params {Date} finalizedAt
   * @params {Date} publishedAt
   */
  constructor({ id, date, time, accessCode, hasStarted, finalizedAt, publishedAt }) {
    this.id = id;
    this.date = date;
    this.time = time;
    this.accessCode = accessCode;
    this.hasStarted = hasStarted;
    this.isNotAccessible = !!finalizedAt || !!publishedAt;
    this.isFinalized = Boolean(finalizedAt);
    this.isPublished = Boolean(publishedAt);
  }

  setStartDate(timezone) {
    if (!timezone) return;
    try {
      this.date = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date());
    } catch {
      // Let the date as it is
    }
  }
}
