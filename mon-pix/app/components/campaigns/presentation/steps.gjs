import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { eq } from 'ember-truth-helpers';

import BadgesStep from './steps/badges';
import CompetencesStep from './steps/competences';

const STEPS = {
  BADGES: 'badges',
  COMPETENCES: 'competences',
  ORGANIZATION: 'organization',
};

export default class CampaignPresentationSteps extends Component {
  #stepsSequence;

  @tracked currentStep;

  constructor() {
    super(...arguments);

    this.#stepsSequence = this.setPresentationStepsSequence();
    this.handleNextStep();
  }

  *setPresentationStepsSequence() {
    if (this.args.model.customLandingPageText) {
      yield STEPS.ORGANIZATION;
    }
    if (this.args.model.competences.length) {
      yield STEPS.COMPETENCES;
    }
    if (this.args.model.badges.length) {
      yield STEPS.BADGES;
    }
  }

  handleNextStep = () => {
    const next = this.#stepsSequence.next();

    if (!next.done) {
      this.currentStep = next.value;
    } else {
      // Rediriger vers la première épreuve
    }
  };

  <template>
    <main class="campaign-presentation-steps">
      {{#if (eq this.currentStep STEPS.BADGES)}}
        <BadgesStep @badges={{@model.badges}} @goToNextStep={{this.handleNextStep}} />
      {{/if}}
      {{#if (eq this.currentStep STEPS.COMPETENCES)}}
        <CompetencesStep @competences={{@model.competences}} @goToNextStep={{this.handleNextStep}} />
      {{/if}}
    </main>
  </template>
}
