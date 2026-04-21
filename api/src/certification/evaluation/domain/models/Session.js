export class Session {
  /**
   * @params {number} id
   * @params {string} date
   * @params {string} accessCode
   * @params {boolean} hasStarted
   * @params {Date} finalizedAt
   * @params {Date} publishedAt
   */
  constructor({ id, date, accessCode, hasStarted, finalizedAt, publishedAt }) {
    this.id = id;
    this.date = date;
    this.accessCode = accessCode;
    this.hasStarted = hasStarted;
    this.isNotAccessible = !!finalizedAt || !!publishedAt;
    this.isFinalized = Boolean(finalizedAt);
    this.isPublished = Boolean(publishedAt);
  }

  updateDate(dateTime) {
    if (this.hasStarted) return;
    const year = dateTime.getFullYear();
    const month = String(dateTime.getMonth() + 1).padStart(2, '0');
    const day = String(dateTime.getDate()).padStart(2, '0');

    this.date = `${year}-${month}-${day}`;
  }
}
