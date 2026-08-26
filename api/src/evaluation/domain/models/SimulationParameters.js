import { KnowledgeElement } from '../../../shared/domain/models/KnowledgeElement.js';
import { calculatePixScore } from '../services/scoring/scoring-service.js';

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

  /**
   * Score de l'utilisateur simulé, calculé comme dans mon-pix : chaque acquis validé rapporte
   * sa pixValue, le total étant plafonné par compétence.
   * @returns {number}
   */
  get pixScore() {
    const skillsById = new Map(this.skills.map((skill) => [skill.id, skill]));

    const validatedKnowledgeElements = this.knowledgeElements
      .filter((knowledgeElement) => knowledgeElement.isValidated && skillsById.has(knowledgeElement.skillId))
      .map((knowledgeElement) => {
        const { pixValue, competenceId } = skillsById.get(knowledgeElement.skillId);
        return new KnowledgeElement({ ...knowledgeElement, earnedPix: pixValue ?? 0, competenceId });
      });

    return calculatePixScore(validatedKnowledgeElements);
  }
}

export { SimulationParameters };
