import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { concat } from '@ember/helper';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import eq from 'ember-truth-helpers/helpers/eq';
import Step from 'mon-pix/components/module/component/step';
import ModuleGrain from 'mon-pix/components/module/grain/grain';
import htmlUnsafe from 'mon-pix/helpers/html-unsafe';
import { inc } from 'mon-pix/helpers/inc';

import didInsert from '../../../modifiers/modifier-did-insert';
import { VERIFY_RESPONSE_DELAY } from './element';

export const NEXT_STEP_BUTTON_DELAY = VERIFY_RESPONSE_DELAY + 500;

export default class ModulixStepper extends Component {
  @service modulixAutoScroll;
  @service modulixPreviewMode;

  displayableSteps = this.args.steps.filter((step) =>
    step.elements.some((element) => ModuleGrain.AVAILABLE_ELEMENT_TYPES.includes(element.type)),
  );

  @tracked stepsToDisplay = this._initialStepsToDisplay;

  @tracked displayedStepIndex = 0;

  @tracked
  preventScrollAndFocus = false;

  @tracked shouldAppearToRight = false;
  @tracked shouldDisplayHorizontalNextButton = this.shouldDisplayNextButton;

  get _initialStepsToDisplay() {
    const firstDisplayableStep = this.displayableSteps[0];
    return this.modulixPreviewMode.isEnabled ? this.displayableSteps : [firstDisplayableStep];
  }

  @action
  stepIsActive(index) {
    return this.displayedStepIndex === index;
  }

  @action
  stepIsHidden(index) {
    if (this.modulixPreviewMode.isEnabled) {
      return false;
    }

    return !this.stepIsActive(index);
  }

  @action
  stepBarIsDisabled(index) {
    return index > this.stepsToDisplay.length - 1;
  }

  get hasDisplayableSteps() {
    return this.displayableSteps.length > 0;
  }

  get userPrefersReducedMotion() {
    const userPrefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    return userPrefersReducedMotion.matches;
  }

  @action
  goBackToPreviousStep() {
    if (this.displayedStepIndex === 0) {
      return;
    }

    this.displayedStepIndex -= 1;
    this.preventScrollAndFocus = true;
  }

  @action
  displayNextStep() {
    this.shouldDisplayHorizontalNextButton = false;
    const currentStepPosition = this.lastDisplayedStepIndex + 1;
    const nextStep = this.displayableSteps[currentStepPosition];
    this.stepsToDisplay = [...this.stepsToDisplay, nextStep];

    if (!this.hasNextStep) {
      this.args.stepperIsFinished();
    }

    this.args.onStepperNextStep(currentStepPosition);
    this.displayedStepIndex = currentStepPosition;
    this.preventScrollAndFocus = false;

    if (!this.userPrefersReducedMotion) {
      this.shouldAppearToRight = true;
      setTimeout(() => {
        this.shouldAppearToRight = false;
      }, 0);
    }
  }

  @action
  goBackToNextStep() {
    if (this.isNextButtonControlDisabled) {
      return;
    }

    this.displayedStepIndex++;
    this.preventScrollAndFocus = true;
  }

  get lastDisplayedStepIndex() {
    return this.stepsToDisplay.length - 1;
  }

  get hasNextStep() {
    return this.stepsToDisplay.length < this.displayableSteps.length;
  }

  get answerableElementsInCurrentStep() {
    const currentStep = this.stepsToDisplay[this.lastDisplayedStepIndex];
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

  @action
  shouldDisplayVerticalNextButton(currentIndex) {
    return this.shouldDisplayNextButton && this.stepIsActive(currentIndex);
  }

  get totalSteps() {
    return this.displayableSteps.length;
  }

  get isHorizontalDirection() {
    return this.args.direction === ModuleGrain.STEPPER_DIRECTION.HORIZONTAL && !this.modulixPreviewMode.isEnabled;
  }

  get isPreviousButtonControlDisabled() {
    return this.displayedStepIndex === 0;
  }

  get isNextButtonControlDisabled() {
    return this.displayedStepIndex === this.lastDisplayedStepIndex;
  }

  get id() {
    return this.args.id || `pix-tabs-${guidFor(this)}`;
  }

  get direction() {
    return this.isHorizontalDirection
      ? ModuleGrain.STEPPER_DIRECTION.HORIZONTAL
      : ModuleGrain.STEPPER_DIRECTION.VERTICAL;
  }

  @action
  async onElementAnswer(...args) {
    await this.waitFor(NEXT_STEP_BUTTON_DELAY);

    await this.args.onElementAnswer(...args);

    this.shouldDisplayHorizontalNextButton = this.shouldDisplayNextButton;
  }

  async waitFor(duration) {
    return new Promise((resolve) => setTimeout(resolve, duration));
  }

  <template>
    {{#if this.modulixPreviewMode.isEnabled}}
      <PixTag @color="dark">
        {{t "pages.modulix.preview.stepper" direction=@direction}}
      </PixTag>
    {{/if}}
    <div
      class="stepper stepper--{{this.direction}}"
      aria-live="{{if (eq @direction 'vertical') 'polite'}}"
      aria-roledescription="{{t 'pages.modulix.stepper.aria-role-description'}}"
      {{didInsert this.modulixAutoScroll.setHTMLElementScrollOffsetCssProperty}}
    >
      {{#if this.isHorizontalDirection}}
        <div class="stepper__controls">
          <PixIconButton
            @ariaLabel={{t "pages.modulix.buttons.stepper.controls.previous.ariaLabel"}}
            @iconName="chevronLeft"
            @isDisabled={{this.isPreviousButtonControlDisabled}}
            @triggerAction={{this.goBackToPreviousStep}}
            aria-controls={{this.id}}
          />
          <p
            class="stepper-controls__position"
            aria-label="{{t
              'pages.modulix.stepper.step.aria-label'
              currentStep=(inc this.displayedStepIndex)
              totalSteps=this.totalSteps
            }}"
          >
            {{inc this.displayedStepIndex}}/{{this.totalSteps}}
          </p>
          <PixIconButton
            @ariaLabel={{t "pages.modulix.buttons.stepper.controls.next.ariaLabel"}}
            @iconName="chevronRight"
            @isDisabled={{this.isNextButtonControlDisabled}}
            @triggerAction={{this.goBackToNextStep}}
            aria-controls={{this.id}}
          />
          <div class="stepper-controls__step-bars" aria-hidden="true">
            {{#each this.displayableSteps as |_ index|}}
              <div
                class="stepper-controls__step-bar
                  {{if (this.stepIsActive index) 'active'}}
                  {{if (this.stepBarIsDisabled index) 'disable'}}"
              >
              </div>
            {{/each}}
          </div>
        </div>
        <div
          id={{this.id}}
          class="stepper__steps"
          aria-live="polite"
          style={{htmlUnsafe (concat "--current-step-index:" this.displayedStepIndex)}}
        >
          {{#if this.hasDisplayableSteps}}
            {{#each this.stepsToDisplay as |step index|}}
              <Step
                @step={{step}}
                @currentStep={{inc index}}
                @totalSteps={{this.totalSteps}}
                @onElementAnswer={{this.onElementAnswer}}
                @onElementRetry={{@onElementRetry}}
                @getLastCorrectionForElement={{@getLastCorrectionForElement}}
                @isActive={{this.stepIsActive index}}
                @isHidden={{this.stepIsHidden index}}
                @onImageAlternativeTextOpen={{@onImageAlternativeTextOpen}}
                @onVideoTranscriptionOpen={{@onVideoTranscriptionOpen}}
                @onFileDownload={{@onFileDownload}}
                @onExpandToggle={{@onExpandToggle}}
                @onNextButtonClick={{this.displayNextStep}}
                @shouldDisplayNextButton={{this.shouldDisplayHorizontalNextButton}}
                @preventScrollAndFocus={{this.preventScrollAndFocus}}
                @shouldAppearToRight={{this.shouldAppearToRight}}
                @updateSkipButton={{@updateSkipButton}}
                @nextButtonName={{t "pages.modulix.buttons.stepper.next.horizontal.name"}}
              />
            {{/each}}
          {{/if}}
        </div>
      {{else}}
        {{#if this.hasDisplayableSteps}}
          {{#each this.stepsToDisplay as |step index|}}
            <Step
              @step={{step}}
              @currentStep={{inc index}}
              @totalSteps={{this.totalSteps}}
              @onElementAnswer={{@onElementAnswer}}
              @onElementRetry={{@onElementRetry}}
              @getLastCorrectionForElement={{@getLastCorrectionForElement}}
              @isActive={{this.stepIsActive index}}
              @isHidden={{false}}
              @onImageAlternativeTextOpen={{@onImageAlternativeTextOpen}}
              @onVideoTranscriptionOpen={{@onVideoTranscriptionOpen}}
              @onFileDownload={{@onFileDownload}}
              @onExpandToggle={{@onExpandToggle}}
              @onNextButtonClick={{this.displayNextStep}}
              @shouldDisplayNextButton={{this.shouldDisplayVerticalNextButton index}}
              @updateSkipButton={{@updateSkipButton}}
              @nextButtonName={{t "pages.modulix.buttons.stepper.next.vertical.name"}}
            />
          {{/each}}
        {{/if}}
      {{/if}}
    </div>
  </template>
}
