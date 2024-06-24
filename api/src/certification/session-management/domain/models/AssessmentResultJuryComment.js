export class AssessmentResultJuryComment {
  /**
   * @param {object} params
   * @param {number} params.id
   * @param {string} params.commentByJury
   * @param {number} params.juryId
   */
  constructor({ id, commentByJury, juryId } = {}) {
    this.id = id;
    this.commentByJury = commentByJury;
    this.juryId = juryId;
  }
}
