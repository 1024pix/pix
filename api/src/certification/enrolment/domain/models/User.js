export class User {
  /**
   * @param {Object} params
   * @param {number} params.id - identifier of the user
   * @param {string} params.lang
   */
  constructor({ id, lang }) {
    this.id = id;
    this.lang = lang;
  }
}
