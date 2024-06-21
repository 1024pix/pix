import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class Steps extends Component {
  @service currentUser;
  @service router;
  @service intl;

  @tracked currentStep = 0;

  get steps() {
    const steps = [];
    const tutorialPageCount = 5;
    const icons = new Map([
      [0, 'icn-recherche.svg'],
      [1, 'icn-focus.svg'],
      [2, 'icn-temps.svg'],
      [3, 'icn-tutos.svg'],
      [4, 'icn-algo.svg'],
    ]);

    for (let i = 0; i < tutorialPageCount; i++) {
      steps.push({
        id: i,
        text: this.intl.t(`pages.tutorial.pages.page${i}.title`),
        explanation: this.intl.t(`pages.tutorial.pages.page${i}.explanation`),
        icon: icons.get(i),
      });
    }
    return steps;
  }

  get stepsCount() {
    return this.steps.length;
  }

  get showNextButton() {
    return this.currentStep < this.steps.length - 1;
  }

  @action
  nextStep() {
    this.currentStep = this.currentStep + 1;
  }

  @action
  goToStep(stepIndex) {
    this.currentStep = stepIndex;
  }

  @action
  async ignoreTutorial() {
    await this.currentUser.user.save({ adapterOptions: { rememberUserHasSeenAssessmentInstructions: true } });

    this.router.transitionTo('campaigns.assessment.start-or-resume', this.args.campaignCode, {
      queryParams: {
        hasConsultedTutorial: true,
      },
    });
  }
}
