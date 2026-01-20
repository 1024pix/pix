import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { eq } from 'ember-truth-helpers';
import Element from 'mon-pix/components/module/component/element';
import Stepper from 'mon-pix/components/module/component/stepper';
import didInsert from 'mon-pix/modifiers/modifier-did-insert';
import { TrackedSet } from 'tracked-built-ins';

export default class ModuleGrain extends Component {
  @service modulixAutoScroll;
  @service intl;
  @tracked answeredElements = new TrackedSet();
  @tracked isSkipButtonDisabled = false;

  grain = this.args.grain;

  static STEPPER_DIRECTION = {
    HORIZONTAL: 'horizontal',
    VERTICAL: 'vertical',
  };

  static AVAILABLE_ELEMENT_TYPES = [
    'audio',
    'custom',
    'custom-draft',
    'download',
    'embed',
    'expand',
    'flashcards',
    'image',
    'qab',
    'qcu',
    'qcu-declarative',
    'qcu-discovery',
    'qcm',
    'qrocm',
    'separator',
    'text',
    'short-video',
    'video',
  ];
  static AVAILABLE_GRAIN_TYPES = [
    'short-lesson',
    'lesson',
    'activity',
    'discovery',
    'challenge',
    'summary',
    'transition',
  ];

  static LOCALLY_ANSWERABLE_ELEMENTS = ['qab', 'qcu-declarative', 'qcu-discovery', 'flashcards'];

  @tracked isStepperFinished = this.hasStepper === false;

  get stepperDirection() {
    if (['challenge', 'activity', 'discovery'].includes(this.grainType)) {
      return ModuleGrain.STEPPER_DIRECTION.HORIZONTAL;
    }
    return ModuleGrain.STEPPER_DIRECTION.VERTICAL;
  }

  get hasStepper() {
    return this.args.grain.components.some((component) => component.type === 'stepper');
  }

  get grainType() {
    if (ModuleGrain.AVAILABLE_GRAIN_TYPES.includes(this.args.grain.type)) {
      return this.args.grain.type;
    } else {
      return 'lesson';
    }
  }

  @action
  updateSkipButton(value) {
    this.isSkipButtonDisabled = value;
  }

  @action
  getLastCorrectionForElement(element) {
    return this.args.passage.getLastCorrectionForElement(element);
  }

  @action
  stepperIsFinished() {
    this.isStepperFinished = true;
  }

  get shouldDisplayContinueButton() {
    if (this.hasStepper) {
      return this.args.canMoveToNextGrain && this.isStepperFinished && this.allElementsAreAnswered;
    } else {
      return this.args.canMoveToNextGrain && this.allElementsAreAnswered;
    }
  }

  get shouldDisplaySkipButton() {
    if (this.hasStepper && !this.isStepperFinished) {
      return this.args.canMoveToNextGrain;
    } else {
      return this.args.canMoveToNextGrain && this.hasAnswerableElements && !this.allElementsAreAnswered;
    }
  }

  static getSupportedElements(grain) {
    return grain.components
      .flatMap((component) => {
        switch (component.type) {
          case 'element':
            return component.element;
          case 'stepper':
            return component.steps.flatMap(({ elements }) => elements);
          default:
            return undefined;
        }
      })
      .filter((element) => {
        return element !== undefined && ModuleGrain.AVAILABLE_ELEMENT_TYPES.includes(element.type);
      });
  }

  get displayableElements() {
    return ModuleGrain.getSupportedElements(this.args.grain);
  }

  static getSupportedComponentElement(component) {
    if (ModuleGrain.AVAILABLE_ELEMENT_TYPES.includes(component.element.type)) {
      return component;
    } else {
      return undefined;
    }
  }

  static getSupportedComponentStepper(component) {
    const steps = [];
    for (const step of component.steps) {
      const elements = step.elements.filter((element) => ModuleGrain.AVAILABLE_ELEMENT_TYPES.includes(element.type));
      if (elements.length > 0) {
        steps.push({ ...step, elements });
      }
    }

    return steps.length > 0 ? { ...component, steps } : undefined;
  }

  static getSupportedComponents(grain) {
    return grain.components
      .map((component) => {
        switch (component.type) {
          case 'element':
            return ModuleGrain.getSupportedComponentElement(component);
          case 'stepper':
            return ModuleGrain.getSupportedComponentStepper(component);
          default:
            return undefined;
        }
      })
      .filter((component) => {
        return component !== undefined;
      });
  }

  get displayableComponents() {
    return ModuleGrain.getSupportedComponents(this.args.grain);
  }

  get hasAnswerableElements() {
    return this.displayableElements.some((element) => element.isAnswerable);
  }

  get answerableElements() {
    return this.displayableElements.filter((element) => {
      return element.isAnswerable;
    });
  }

  get allElementsAreAnswered() {
    return this.answerableElements.every((element) => {
      return this.args.passage.hasAnswerAlreadyBeenVerified(element) || this.answeredElements.has(element.id);
    });
  }

  @action
  focusAndScroll(htmlElement) {
    if (!this.args.shouldFocusAndScroll) {
      return;
    }

    if (!this.args.hasJustAppeared) {
      return;
    }

    this.modulixAutoScroll.focusAndScroll(htmlElement);
  }

  @action
  async onModuleTerminate() {
    await this.args.onModuleTerminate({ grainId: this.args.grain.id });
  }

  @action
  async onElementAnswer(answerData) {
    if (ModuleGrain.LOCALLY_ANSWERABLE_ELEMENTS.includes(answerData.element.type)) {
      const elementId = answerData.element.id;
      this.answeredElements.add(elementId);
      return;
    }

    await this.args.onElementAnswer(answerData);
  }

  get hasTitle() {
    return this.args.grain.title && this.args.grain.title.length > 0;
  }

  get elementId() {
    return `grain_${this.args.grain.id}`;
  }

  get isGrainTypeSummary() {
    return this.args.grain.type === 'summary';
  }

  get isGrainTypeWithTitle() {
    return this.args.grain.type === 'lesson' || this.args.grain.type === 'summary';
  }

  get isGrainTypeActivity() {
    return this.args.grain.type === 'activity';
  }

  get grainTitle() {
    switch (this.args.grain.type) {
      case 'lesson':
        return this.intl.t('pages.modulix.grain.title.lesson');
      case 'summary':
        return this.intl.t('pages.modulix.grain.title.summary');
      default:
        return '';
    }
  }

  get skipButtonLabel() {
    if (!this.hasStepper) {
      return this.intl.t('pages.modulix.buttons.grain.skipActivity');
    }

    const stepper = this.args.grain.components.find((component) => component.type === 'stepper');
    const stepperElements = stepper.steps.flatMap((step) => step.elements);
    const stepperWithAnswerableElement = stepperElements.some((element) => element.isAnswerable);
    return stepperWithAnswerableElement
      ? this.intl.t('pages.modulix.buttons.grain.skipActivity')
      : this.intl.t('pages.modulix.buttons.grain.skip');
  }

  <template>
    <article
      id={{this.elementId}}
      class="grain {{if @hasJustAppeared 'grain--active'}}"
      tabindex="-1"
      {{didInsert this.focusAndScroll}}
    >
      <h3 class="screen-reader-only">{{t
          "pages.modulix.flashcards.navigation.longCurrentStep"
          current=@currentStep
          total=@totalSteps
        }}</h3>
      <div class="grain__card grain-card--{{this.grainType}}">
        {{#if this.isGrainTypeActivity}}
          <PixTag class="grain-card-tag" @color="grey">
            {{t "pages.modulix.grain.tag.activity"}}
          </PixTag>
        {{/if}}
        {{#if this.isGrainTypeWithTitle}}
          <h3 class="grain-card-title">
            {{this.grainTitle}}</h3>
        {{/if}}
        <div class="grain-card__content">
          <!-- eslint-disable-next-line no-unused-vars -->
          {{#each this.displayableComponents as |component|}}
            {{#if (eq component.type "element")}}
              <div class="grain-card-content__element">
                <Element
                  @element={{component.element}}
                  @passageId={{@passage.id}}
                  @onImageAlternativeTextOpen={{@onImageAlternativeTextOpen}}
                  @onVideoTranscriptionOpen={{@onVideoTranscriptionOpen}}
                  @onElementAnswer={{this.onElementAnswer}}
                  @onElementRetry={{@onElementRetry}}
                  @getLastCorrectionForElement={{this.getLastCorrectionForElement}}
                  @onFileDownload={{@onFileDownload}}
                  @onExpandToggle={{@onExpandToggle}}
                  @updateSkipButton={{this.updateSkipButton}}
                />
              </div>
            {{else if (eq component.type "stepper")}}
              <div class="grain-card-content__stepper">
                <Stepper
                  @steps={{component.steps}}
                  @onElementAnswer={{this.onElementAnswer}}
                  @onElementRetry={{@onElementRetry}}
                  @passage={{@passage}}
                  @getLastCorrectionForElement={{this.getLastCorrectionForElement}}
                  @stepperIsFinished={{this.stepperIsFinished}}
                  @onStepperNextStep={{@onStepperNextStep}}
                  @onImageAlternativeTextOpen={{@onImageAlternativeTextOpen}}
                  @onVideoTranscriptionOpen={{@onVideoTranscriptionOpen}}
                  @onFileDownload={{@onFileDownload}}
                  @onExpandToggle={{@onExpandToggle}}
                  @direction={{this.stepperDirection}}
                  @updateSkipButton={{this.updateSkipButton}}
                />
              </div>
            {{/if}}
          {{/each}}
        </div>
      </div>

      {{#if this.shouldDisplaySkipButton}}
        <footer class="grain-card__footer">
          <PixButton
            @variant="tertiary"
            @triggerAction={{@onGrainSkip}}
            @iconAfter="arrowBottom"
            @isDisabled={{this.isSkipButtonDisabled}}
          >
            {{this.skipButtonLabel}}
          </PixButton>
        </footer>
      {{/if}}

      {{#if this.shouldDisplayContinueButton}}
        <footer class="grain-card__footer">
          <PixButton @variant="primary" @triggerAction={{@onGrainContinue}}>
            {{t "pages.modulix.buttons.grain.continue"}}
          </PixButton>
        </footer>
      {{/if}}

      {{#if @shouldDisplayTerminateButton}}
        <footer class="grain-card__footer">
          <PixButton @variant="primary" @triggerAction={{this.onModuleTerminate}}>
            {{t "pages.modulix.buttons.grain.terminate"}}
          </PixButton>
        </footer>
      {{/if}}
    </article>
  </template>
}
