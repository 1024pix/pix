export class Session {
  /**
   * @params {number} id
   * @params {Date} finalizedAt
   * @params {Date} publishedAt
   */
  constructor({ id, finalizedAt, publishedAt }) {
    this.id = id;
    this.isFinalized = Boolean(finalizedAt);
    this.isPublished = Boolean(publishedAt);
  }
}
