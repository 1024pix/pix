/**
 * @class InvigilatorSession
 */
class InvigilatorSession {
  /**
   * @param {date} finalizedAt
   * @param {string} invigilatorPassword
   */
  constructor({ finalizedAt, invigilatorPassword }) {
    this.invigilatorPassword = invigilatorPassword;
    this.isNotJoinable = !!finalizedAt;
  }

  checkPassword(invigilatorPassword) {
    return this.invigilatorPassword === invigilatorPassword;
  }
}

export { InvigilatorSession };
