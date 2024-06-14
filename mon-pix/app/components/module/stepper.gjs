import PixButton from '@1024pix/pix-ui/components/pix-button';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import ModuleGrain from 'mon-pix/components/module/grain';
import Step from 'mon-pix/components/module/step';
import { inc } from 'mon-pix/helpers/inc';

export default class ModulixStepper extends Component {
  displayableSteps = this.args.steps.filter((step) =>
    step.elements.some((element) => ModuleGrain.AVAILABLE_ELEMENT_TYPES.includes(element.type)),
  );

  @tracked
  stepsToDisplay = [this.displayableSteps[0]];

  get hasDisplayableSteps() {
    return this.displayableSteps.length > 0;
  }

  @action
  displayNextStep() {
    const nextStep = this.displayableSteps[this.lastIndex + 1];
    this.stepsToDisplay = [...this.stepsToDisplay, nextStep];
  }

  get lastIndex() {
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
    {{#if this.hasDisplayableSteps}}
      {{#each this.stepsToDisplay as |step index|}}
        <Step
          @step={{step}}
          @currentStep={{inc index}}
          @totalSteps={{this.displayableSteps.length}}
          @submitAnswer={{@submitAnswer}}
          @retryElement={{@retryElement}}
          @getLastCorrectionForElement={{@getLastCorrectionForElement}}
        />
      {{/each}}
      {{#if this.shouldDisplayNextButton}}
        <PixButton @size="large" @variant="primary" @iconAfter="arrow-down" @triggerAction={{this.displayNextStep}}>{{t
            "pages.modulix.buttons.stepper.next"
          }}
        </PixButton>
      {{/if}}
    {{/if}}
  </template>
}
