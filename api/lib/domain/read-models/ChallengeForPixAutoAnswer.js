const ChallengeType = Object.freeze({
  QCU: 'QCU',
  QCM: 'QCM',
  QROC: 'QROC',
  QROCM_IND: 'QROCM-ind',
  QROCM_DEP: 'QROCM-dep',
});

class ChallengeForPixAutoAnswer {
  /**
   * Constructeur d'épreuve pour le bouton magique (pix-auto-answer)
   *
   * @param id
   * @param solution
   * @param type
   * @param autoReply
   */
  constructor({ id, solution, type, autoReply } = {}) {
    this.id = id;
    this.solution = solution;
    this.type = type;
    this.autoReply = autoReply;
  }
}

ChallengeForPixAutoAnswer.Type = ChallengeType;

export default ChallengeForPixAutoAnswer;
