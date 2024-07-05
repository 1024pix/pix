import PixButton from '@1024pix/pix-ui/components/pix-button';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import ModuleGrain from 'mon-pix/components/module/grain';
import Step from 'mon-pix/components/module/step';
import { inc } from 'mon-pix/helpers/inc';

import didInsert from '../../modifiers/modifier-did-insert';

export default class ModulixStepper extends Component {
  @service modulixAutoScroll;

  displayableSteps = this.args.steps.filter((step) =>
    step.elements.some((element) => ModuleGrain.AVAILABLE_ELEMENT_TYPES.includes(element.type)),
  );

  @tracked
  stepsToDisplay = [this.displayableSteps[0]];

  @action
  hasStepJustAppeared(index) {
    if (this.stepsToDisplay.length === 1) {
      return false;
    }

    return this.stepsToDisplay.length - 1 === index;
  }

  get hasDisplayableSteps() {
    return this.displayableSteps.length > 0;
  }

  @action
  displayNextStep() {
    const currentStepPosition = this.currentStepIndex + 1;
    const nextStep = this.displayableSteps[currentStepPosition];
    this.stepsToDisplay = [...this.stepsToDisplay, nextStep];

    if (!this.hasNextStep) {
      this.args.stepperIsFinished();
    }

    this.args.continueToNextStep(currentStepPosition);
  }

  get currentStepIndex() {
    return this.stepsToDisplay.length - 1;
  }

  get hasNextStep() {
    return this.stepsToDisplay.length < this.displayableSteps.length;
  }

  get answerableElementsInCurrentStep() {
    const currentStep = this.stepsToDisplay[this.stepsToDisplay.length - 1];
    return currentStep.elements.filter((element) => element.isAnswerable);
  }

  get allAnswerableElementsAreAnsweredInCurrentStep() {
    return this.answerableElementsInCurrentStep.every((element) => {
      return this.args.passage.getLastCorrectionForElement(element) !== undefined;
    });
  }

  get shouldDisplayNextButton() {
    return this.hasNextStep && this.allAnswerableElementsAreAnsweredInCurrentStep;
  }

  <template>
    <div
      class="stepper"
      aria-live="assertive"
      {{didInsert this.modulixAutoScroll.setHTMLElementScrollOffsetCssProperty}}
    >
      {{#if this.hasDisplayableSteps}}
        {{#each this.stepsToDisplay as |step index|}}
          <Step
            @step={{step}}
            @currentStep={{inc index}}
            @totalSteps={{this.displayableSteps.length}}
            @submitAnswer={{@submitAnswer}}
            @retryElement={{@retryElement}}
            @getLastCorrectionForElement={{@getLastCorrectionForElement}}
            @hasJustAppeared={{this.hasStepJustAppeared index}}
          />
        {{/each}}
        {{#if this.shouldDisplayNextButton}}
          <PixButton
            aria-label="{{t 'pages.modulix.buttons.stepper.next.ariaLabel'}}"
            @variant="primary"
            @iconAfter="arrow-down"
            @triggerAction={{this.displayNextStep}}
          >{{t "pages.modulix.buttons.stepper.next.name"}}
          </PixButton>
        {{/if}}
      {{/if}}
    </div>
  </template>
}
