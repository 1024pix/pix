import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { concat } from '@ember/helper';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { trackedSet } from '@ember/reactive/collections';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import eq from 'ember-truth-helpers/helpers/eq';
import Step from 'mon-pix/components/module/component/step';
import ModuleGrain from 'mon-pix/components/module/grain/grain';
import htmlUnsafe from 'mon-pix/helpers/html-unsafe';
import { inc } from 'mon-pix/helpers/inc';
import { localCopy } from 'tracked-toolbox';

import didInsert from '../../../modifiers/modifier-did-insert';
import { VERIFY_RESPONSE_DELAY } from './element';

export const NEXT_STEP_BUTTON_DELAY = VERIFY_RESPONSE_DELAY;

export default class ModulixStepper extends Component {
  @tracked locallyAnsweredElements = trackedSet();

  @service modulixAutoScroll;
  @service modulixPreviewMode;

  displayableSteps = this.args.steps.filter((step) =>
    step.elements.some((element) => ModuleGrain.AVAILABLE_ELEMENT_TYPES.includes(element.type)),
  );

  @tracked stepsToDisplay = this._initialStepsToDisplay;

  @tracked displayedStepIndex = 0;

  @localCopy('args.preventInitialFocusAndScroll', false) preventFocusAndScroll;

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
    this.preventFocusAndScroll = true;
  }

  @action
  displayNextStep() {
    const currentStepPosition = this.lastDisplayedStepIndex + 1;
    const nextStep = this.displayableSteps[currentStepPosition];
    this.stepsToDisplay = [...this.stepsToDisplay, nextStep];

    this.shouldDisplayHorizontalNextButton = this.shouldDisplayNextButton;

    if (!this.hasNextStep) {
      this.args.stepperIsFinished();
    }

    this.args.onStepperNextStep(currentStepPosition);
    this.displayedStepIndex = currentStepPosition;
    this.preventFocusAndScroll = false;

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
    this.preventFocusAndScroll = true;
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
      return (
        this.args.passage.getLastCorrectionForElement(element) !== undefined ||
        this.locallyAnsweredElements.has(element.id)
      );
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
    return this.args.direction === ModuleGrain.STEPPER_DIRECTION.HORIZONTAL;
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
    return this.canUseHorizontalStepperDesign
      ? ModuleGrain.STEPPER_DIRECTION.HORIZONTAL
      : ModuleGrain.STEPPER_DIRECTION.VERTICAL;
  }

  get canUseHorizontalStepperDesign() {
    return this.isHorizontalDirection && !this.modulixPreviewMode.isEnabled;
  }

  @action
  async onElementAnswer(...args) {
    await this.waitFor(NEXT_STEP_BUTTON_DELAY);

    args.forEach((elementAnswer) => {
      if (ModuleGrain.LOCALLY_ANSWERABLE_ELEMENTS.includes(elementAnswer.element.type)) {
        this.locallyAnsweredElements.add(elementAnswer.element.id);
      }
    });

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
      {{#if this.isHorizontalDirection}}
        <div class="stepper-instruction--preview-mode">
          {{htmlUnsafe @instruction}}
        </div>
      {{/if}}
    {{/if}}
    <div
      class="stepper stepper--{{this.direction}}{{if this.modulixPreviewMode.isEnabled ' stepper--preview-mode' ''}}"
      aria-live="{{if (eq @direction 'vertical') 'polite'}}"
      aria-roledescription="{{t 'pages.modulix.stepper.aria-role-description'}}"
      {{didInsert this.modulixAutoScroll.setHTMLElementScrollOffsetCssProperty}}
    >
      {{#if this.canUseHorizontalStepperDesign}}
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
        {{#if @instruction}}
          <div class="stepper__instruction">
            {{htmlUnsafe @instruction}}
          </div>
        {{/if}}
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
                @preventFocusAndScroll={{this.preventFocusAndScroll}}
                @shouldAppearToRight={{this.shouldAppearToRight}}
                @updateSkipButton={{@updateSkipButton}}
                @nextButtonName={{t "pages.modulix.buttons.stepper.next.horizontal.name"}}
                @lastDisplayedStepIndex={{this.lastDisplayedStepIndex}}
                @passageId={{@passage.id}}
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
              @onElementAnswer={{this.onElementAnswer}}
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
              @preventFocusAndScroll={{this.preventFocusAndScroll}}
              @updateSkipButton={{@updateSkipButton}}
              @nextButtonName={{t "pages.modulix.buttons.stepper.next.vertical.name"}}
              @lastDisplayedStepIndex={{index}}
              @passageId={{@passage.id}}
            />
          {{/each}}
        {{/if}}
      {{/if}}
    </div>
  </template>
}
