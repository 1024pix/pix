import { action } from '@ember/object';
import Component from '@glimmer/component';

const SKILLS_STATUSES = {
  MISSING: 'missing',
  CURRENT: 'current',
  PRESENT: 'present',
  VALIDATED: 'validated',
  ELIMINATED: 'eliminated',
  INVALIDATED: 'invalidated',
};

const STEPS = {
  NO_CHALLENGE: {
    translatedName: 'Acquis sans épreuves',
    description:
      'Supprime les acquis qui ne contiennent aucun challenge ou qui ne contiennent que des challenges déjà joués dans cette évaluation',
  },
  EASY_TUBES: {
    translatedName: 'Tubes faciles',
    description: "Si applicable, ne garde que les tubes qui ne contiennent pas d'acquis supérieurs au niveau 3",
  },
  TIMED_SKILLS: {
    translatedName: 'Épreuves chronométrées',
    description:
      "Si l'utilisateur vient de commencer ou que la précédente épreuve était chronométrée, cette étape filtre les acquis dont le prochain challenge est chronométré",
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

  @action
  getSkillStatus(tube, level) {
    const skill = tube.skills.find((skill) => skill.difficulty === level);
    if (!skill) return SKILLS_STATUSES.MISSING;

    if (skill.id === this.args.currentSkillId) return SKILLS_STATUSES.CURRENT;

    const skillInKnowledgeElements = this.args.knowledgeElements.find(
      (knowledgeElement) => knowledgeElement.skillId === skill.id,
    );
    if (skillInKnowledgeElements) return skillInKnowledgeElements.status;

    return SKILLS_STATUSES.PRESENT;
  }

  @action
  panpan(tube, level) {
    const skill = tube.skills.find((skill) => skill.difficulty === level);
    if (!skill) return;

    const skillInSelectedStep = this.steps[this.args.displayedStepIndex].outputSkills.find(
      (outputSkill) => outputSkill.id === skill.id,
    );
    if (!skillInSelectedStep) return 'crossed';
  }

  get steps() {
    return this.args.smartRandomDetails.steps;
  }

  get predictedLevel() {
    return this.args.smartRandomDetails.predictedLevel;
  }

  getStepName(stepName) {
    return STEPS[stepName].translatedName;
  }

  getStepDescription(stepName) {
    return STEPS[stepName].description;
  }

  @action
  getStepTagColor(stepIndex) {
    if (stepIndex < this.args.displayedStepIndex) return 'primary';

    return stepIndex === this.args.displayedStepIndex ? 'primary' : 'neutral';
  }

  @action
  getEliminatedSkillsByStepCount(stepIndex) {
    return stepIndex === 0
      ? this.args.totalNumberOfSkills - this.steps[0].outputSkills.length
      : this.steps[stepIndex - 1].outputSkills.length - this.steps[stepIndex].outputSkills.length;
  }

  @action
  getRemainingSkillsCountAfterStep(stepIndex) {
    return this.steps[stepIndex].outputSkills.length;
  }
}
