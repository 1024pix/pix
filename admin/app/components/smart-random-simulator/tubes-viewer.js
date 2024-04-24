import { action } from '@ember/object';
import Component from '@glimmer/component';

const SKILLS_STATUSES = {
  MISSING: 'missing',
  CURRENT: 'current',
  PRESENT: 'present',
  ELIMINATED: 'eliminated',
};

const PRIMARY_COLOR = 'primary';
const NEUTRAL_COLOR = 'neutral';

const STEPS = {
  NO_CHALLENGE: {
    translatedName: 'Acquis sans épreuves',
    description:
      'Supprime les acquis qui ne contiennent aucun challenge ou qui ne contiennent que des challenges déjà joués dans cette évaluation',
  },
  EASY_TUBES: {
    translatedName: 'Tubes faciles',
    description:
      'Si applicable, garde seulement les tubes qui contiennent uniquement des acquis inférieurs au niveau 3',
  },
  TIMED_SKILLS: {
    translatedName: 'Épreuves chronométrées',
    description:
      "Si l'utilisateur vient de commencer ou que la précédente épreuve était chronométrée, " +
      'cette étape supprime les acquis avec une épreuve chronométré.' +
      "Ne s'applique pas si il ne reste plus que des épreuves chronométrés",
  },
  DEFAULT_LEVEL: {
    translatedName: 'Niveau par défaut',
    description:
      "Ne garde que les épreuves de niveau 2, si aucun acquis de niveau 2 n'est disponible, garde seulement les acquis de plus petit niveau. Ne se déclenche que pour la première épreuve de l'évaluation",
  },
  RANDOM_PICK: {
    translatedName: 'Choix aléatoire',
    description: 'Sélectionne un acquis au hasard parmi les acquis restants',
  },
  MAX_REWARDING_SKILLS: {
    translatedName: 'Acquis les plus lucratifs',
    description:
      'Calculés à partir de la probabilité de bonne réponse d’un utilisateur à un niveau donné ainsi que la présence d’autres acquis dans le sujet de l’acquis évalué.',
  },
  TOO_DIFFICULT: {
    translatedName: 'Acquis trop difficiles',
    description:
      'Supprime les acquis de niveau strictement supérieur à 2 par rapport au niveau estimé de l’utilisateur',
  },
  ALREADY_TESTED: {
    translatedName: 'Déjà testés',
    description: "Supprime les acquis déjà présents dans les ke de l'utilisateur",
  },
};

export default class TubesViewer extends Component {
  levels = [1, 2, 3, 4, 5, 6, 7, 8];

  get steps() {
    return this.args.smartRandomDetails.steps;
  }

  get predictedLevel() {
    return this.args.smartRandomDetails.predictedLevel;
  }

  @action
  getStepTagColor(stepIndex) {
    return stepIndex <= this.args.displayedStepIndex ? PRIMARY_COLOR : NEUTRAL_COLOR;
  }

  @action
  getEliminatedSkillsByStepCount(stepIndex) {
    const currentStep = this.steps[stepIndex];
    const currentStepSkillsCount = currentStep.outputSkills.length;

    if (stepIndex === 0) return this.args.totalNumberOfSkills - currentStepSkillsCount;

    const previousStep = this.steps[stepIndex - 1];
    const previousStepSkillsCount = previousStep.outputSkills.length;

    return previousStepSkillsCount - currentStepSkillsCount;
  }

  @action
  getRemainingSkillsCountAfterStep(stepIndex) {
    return this.steps[stepIndex].outputSkills.length;
  }

  @action
  getSkillStatus(tube, level) {
    const skillInTube = tube.skills.find((skill) => skill.difficulty === level);

    if (!skillInTube) return SKILLS_STATUSES.MISSING;

    const isCurrentSkill = this.isSkillTheCurrentSkill(skillInTube);
    if (isCurrentSkill) return SKILLS_STATUSES.CURRENT;

    const knowledgeElementForSkill = this.knowledgeElementForSkill(skillInTube);
    if (knowledgeElementForSkill) return knowledgeElementForSkill.status;

    const skillInSelectedStep = this.isSkillInSelectedStep(skillInTube);
    if (!skillInSelectedStep) return SKILLS_STATUSES.ELIMINATED;

    return SKILLS_STATUSES.PRESENT;
  }

  isSkillTheCurrentSkill(skill) {
    return skill.id === this.args.currentSkillId;
  }

  isSkillInSelectedStep(skill) {
    return this.steps[this.args.displayedStepIndex].outputSkills.some((outputSkill) => outputSkill.id === skill.id);
  }

  knowledgeElementForSkill(skill) {
    return this.args.knowledgeElements.find((knowledgeElement) => knowledgeElement.skillId === skill.id);
  }

  getStepName(stepName) {
    return STEPS[stepName].translatedName;
  }

  getStepDescription(stepName) {
    return STEPS[stepName].description;
  }
}
