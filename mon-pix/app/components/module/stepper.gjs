import PixButton from '@1024pix/pix-ui/components/pix-button';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import Step from 'mon-pix/components/module/step';
import { inc } from 'mon-pix/helpers/inc';

export default class ModulixStepper extends Component {
  @tracked
  stepsToDisplay = [this.args.steps[0]];

  @action
  displayNextStep() {
    const nextStep = this.args.steps[this.lastIndex + 1];
    this.stepsToDisplay = [...this.stepsToDisplay, nextStep];
  }

  get lastIndex() {
    return this.stepsToDisplay.length - 1;
  }

  get hasNextStep() {
    return this.stepsToDisplay.length < this.args.steps.length;
  }

  get hasAnswerableElementInCurrentStep() {
    const currentStep = this.stepsToDisplay[this.stepsToDisplay.length - 1];
    return currentStep.elements.some((element) => element.isAnswerable);
  }

  get shouldDisplayNextButton() {
    return this.hasNextStep && !this.hasAnswerableElementInCurrentStep;
  }

  <template>
    {{#each this.stepsToDisplay as |step index|}}
      <Step
        @step={{step}}
        @currentStep={{inc index}}
        @totalSteps={{@steps.length}}
        @getLastCorrectionForElement={{@getLastCorrectionForElement}}
      />
    {{/each}}
    {{#if this.shouldDisplayNextButton}}
      <PixButton @size="large" @variant="primary" @iconAfter="arrow-down" @triggerAction={{this.displayNextStep}}>{{t
          "pages.modulix.buttons.stepper.next"
        }}
      </PixButton>
    {{/if}}
  </template>
}
