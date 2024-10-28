import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { eq } from 'ember-truth-helpers';

import BadgesStep from './steps/badges';
import CompetencesStep from './steps/competences';
import OrganizationStep from './steps/organization';

const STEPS = {
  BADGES: 'badges',
  COMPETENCES: 'competences',
  ORGANIZATION: 'organization',
};

export default class CampaignPresentationSteps extends Component {
  @service currentUser;
  @service router;

  #steps = [];
  @tracked currentStepIndex;

  constructor() {
    super(...arguments);

    this.initializeSteps();

    if (this.router.currentRoute.queryParams?.currentStep) {
      this.setNextStep(this.#steps.indexOf(this.router.currentRoute.queryParams.currentStep));
    } else {
      this.setNextStep(0);
    }
  }

  initializeSteps = () => {
    if (this.args.presentationSteps.customLandingPageText) {
      this.#steps.push(STEPS.ORGANIZATION);
    }
    if (this.args.presentationSteps.competences?.length) {
      this.#steps.push(STEPS.COMPETENCES);
    }
    if (this.args.presentationSteps.badges?.length) {
      this.#steps.push(STEPS.BADGES);
    }
  };

  setQueryParams = (step) => {
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.set('currentStep', step);
    window.history.replaceState(null, null, `?${queryParams.toString()}`);
  };

  setNextStep = (stepIndex) => {
    this.setQueryParams(this.#steps[stepIndex]);
    this.currentStepIndex = stepIndex;
  };

  handleNextStep = async () => {
    if (this.currentStepIndex !== this.#steps.length - 1) {
      this.setNextStep(this.currentStepIndex + 1);
    } else {
      await this.currentUser.user.save({ adapterOptions: { rememberUserHasSeenAssessmentInstructions: true } });
      this.router.transitionTo('campaigns.assessment.start-or-resume', this.args.campaignCode, {
        queryParams: {
          hasConsultedTutorial: true,
        },
      });
    }
  };

  get currentStepName() {
    return this.#steps[this.currentStepIndex];
  }

  <template>
    <main class="campaign-presentation-steps">
      {{#if (eq this.currentStepName STEPS.ORGANIZATION)}}
        <OrganizationStep
          @customOrganizationText={{@presentationSteps.customLandingPageText}}
          @goToNextStep={{this.handleNextStep}}
        />
      {{/if}}
      {{#if (eq this.currentStepName STEPS.BADGES)}}
        <BadgesStep @badges={{@presentationSteps.badges}} @goToNextStep={{this.handleNextStep}} />
      {{/if}}
      {{#if (eq this.currentStepName STEPS.COMPETENCES)}}
        <CompetencesStep @competences={{@presentationSteps.competences}} @goToNextStep={{this.handleNextStep}} />
      {{/if}}
    </main>
  </template>
}
