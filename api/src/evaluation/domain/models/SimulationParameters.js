class SimulationParameters {
  /**
   * @param {KnowledgeElement[]} knowledgeElements
   * @param {Answer[]} answers
   * @param {Skill[]} skills
   * @param {Challenge[]} challenges
   * @param {('en'|'fr-fr'|'fr'|'nl')} locale
   * @param {number} assessmentId
   */
  constructor({ knowledgeElements, answers, skills, challenges, locale, assessmentId } = {}) {
    this.knowledgeElements = knowledgeElements;
    this.answers = answers;
    this.skills = skills;
    this.challenges = challenges;
    this.locale = locale;
    this.assessmentId = assessmentId;
  }
}

export { SimulationParameters };
