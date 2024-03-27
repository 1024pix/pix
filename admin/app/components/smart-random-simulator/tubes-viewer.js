import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

const SKILLS_STATUSES = {
  MISSING: 'missing',
  PRESENT: 'present',
  VALIDATED: 'validated',
  ELIMINATED: 'eliminated',
  INVALIDATED: 'invalidated',
};

export default class TubesViewer extends Component {
  @tracked
  displayedStep = this.stepsNumber;
  levels = [1, 2, 3, 4, 5, 6, 7, 8];

  get selectOptions() {
    return this.args.stepsDetails.map((step, index) => ({
      label: `Étape ${index + 1}`,
      // PixSelect component does not consider 0 as a value, this causes display issues
      value: index + 1,
    }));
  }

  get stepName() {
    return this.args.stepsDetails[this.displayedStep].name;
  }

  get stepsNumber() {
    return this.args.stepsDetails.length - 1;
  }

  get selectValue() {
    return this.displayedStep + 1;
  }

  @action
  getSkillStatus(tube, level) {
    const skill = tube.skills.find((skill) => skill.difficulty === level);
    if (!skill) return SKILLS_STATUSES.MISSING;

    const skillInKnowledgeElements = this.args.knowledgeElements.find(
      (knowledgeElement) => knowledgeElement.skillId === skill.id,
    );

    if (skillInKnowledgeElements) return skillInKnowledgeElements.status;

    const skillInSelectedStep = this.args.stepsDetails[this.displayedStep].outputSkills.find(
      (outputSkill) => outputSkill.id === skill.id,
    );

    if (skillInSelectedStep) return SKILLS_STATUSES.PRESENT;

    return SKILLS_STATUSES.ELIMINATED;
  }

  @action
  selectStep(value) {
    this.displayedStep = value - 1;
  }
}
