class SimulationParameters {
  /**
   * @param {KnowledgeState} knowledgeState
   * @param {Answer[]} answers
   * @param {Skill[]} skills
   * @param {Challenge[]} challenges
   * @param {('en'|'fr-fr'|'fr'|'nl')} locale
   * @param {number} assessmentId
   */
  constructor({ knowledgeState, answers, skills, challenges, locale, assessmentId } = {}) {
    this.knowledgeState = knowledgeState;
    this.answers = answers;
    this.skills = skills;
    this.challenges = challenges;
    this.locale = locale;
    this.assessmentId = assessmentId;
  }
}

export { SimulationParameters };
