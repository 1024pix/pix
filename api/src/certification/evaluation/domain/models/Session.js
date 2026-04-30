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

  updateDateAndTime(dateTime) {
    const year = dateTime.getFullYear();
    const month = String(dateTime.getMonth() + 1).padStart(2, '0');
    const day = String(dateTime.getDate()).padStart(2, '0');
    const hours = String(dateTime.getHours()).padStart(2, '0');
    const minutes = String(dateTime.getMinutes()).padStart(2, '0');

    this.date = `${year}-${month}-${day}`;
    this.time = `${hours}:${minutes}:00`;
  }
}
