export class Session {
  /**
   * @params {number} id
   * @params {string} date
   * @params {string} accessCode
   * @params {Date} finalizedAt
   * @params {Date} publishedAt
   */
  constructor({ id, date, accessCode, finalizedAt, publishedAt }) {
    this.id = id;
    this.date = date;
    this.accessCode = accessCode;
    this.isNotAccessible = !!finalizedAt || !!publishedAt;
    this.isFinalized = Boolean(finalizedAt);
    this.isPublished = Boolean(publishedAt);
  }
}
