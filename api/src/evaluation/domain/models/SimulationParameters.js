import { calculatePixScore } from '../services/scoring/scoring-service.js';

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

  /**
   * Score de l'utilisateur simulé, calculé comme dans mon-pix : chaque acquis validé rapporte
   * sa pixValue, le total étant plafonné par compétence.
   * @returns {number}
   */
  get pixScore() {
    const validatedSkills = this.knowledgeState
      .validatedSkills(this.skills)
      .map((skill) => ({ ...skill, pixValue: skill.pixValue ?? 0 }));

    return calculatePixScore(validatedSkills);
  }
}

export { SimulationParameters };
