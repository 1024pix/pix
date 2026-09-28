import { PixButton } from '@1024pix/nebulix-ember';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import eq from 'ember-truth-helpers/helpers/eq';
import inc from 'mon-pix/helpers/inc';

import didInsert from '../../../../modifiers/modifier-did-insert';

export default class Steps extends Component {
  <template>
    {{#each this.steps as |step index|}}
      {{#if (eq index this.currentStep)}}
        <div class="campaign-tutorial__title" tabIndex="-1" {{didInsert this.setFocus}}>
          {{step.text}}
        </div>

        <div class="campaign-tutorial__explanation-icon">
          <img alt src="/images/illustrations/tutorial-campaign/{{step.icon}}" role="presentation" />
        </div>

        <div class="campaign-tutorial__explanation-text">
          <p>{{step.explanation}}</p>
        </div>
      {{/if}}
    {{/each}}

    <nav aria-label={{t "pages.tutorial.dots-nav-label"}}>
      <ol class="campaign-tutorial__paging">
        {{#each this.steps as |step index|}}
          <li aria-current={{if (eq index this.currentStep) "step" null}}>
            <button
              type="button"
              class="dot"
              title={{t "pages.tutorial.dot-action-title" stepNumber=(inc index) stepsCount=this.stepsCount}}
              {{on "click" (fn this.goToStep index)}}
            ></button>
          </li>
        {{/each}}
      </ol>
    </nav>

    <div class="campaign-tutorial__next-button">
      {{#if this.showNextButton}}
        <PixButton
          @triggerAction={{this.nextStep}}
          class="campaign-tutorial__buttons"
          title={{t "pages.tutorial.next-title"}}
        >
          {{t "pages.tutorial.next"}}
        </PixButton>
        <PixButton
          @variant="secondary"
          @triggerAction={{this.ignoreTutorial}}
          class="campaign-tutorial__buttons"
          title={{t "pages.tutorial.pass-title"}}
        >
          {{t "pages.tutorial.pass"}}
        </PixButton>
      {{else}}
        <PixButton @triggerAction={{this.ignoreTutorial}}>
          {{t "pages.tutorial.start"}}
        </PixButton>
      {{/if}}
    </div>
  </template>
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
  setFocus(element) {
    element.focus({ focusVisible: false });
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
