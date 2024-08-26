import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import DumbGrain from 'mon-pix/components/module/grain/dumb-grain';
import didInsert from 'mon-pix/modifiers/modifier-did-insert';

export default class ModuleGrain extends Component {
  @service modulixAutoScroll;

  grain = this.args.grain;

  @tracked isStepperFinished = this.hasStepper === false;

  get hasStepper() {
    return this.args.grain.components.some((component) => component.type === 'stepper');
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
      return this.args.passage.hasAnswerAlreadyBeenVerified(element);
    });
  }

  get displayableElements() {
    return DumbGrain.getSupportedElements(this.args.grain);
  }

  @action
  focusAndScroll(htmlElement) {
    if (!this.args.hasJustAppeared) {
      return;
    }

    this.modulixAutoScroll.focusAndScroll(htmlElement);
  }

  @action
  onModuleTerminate() {
    this.args.onModuleTerminate({ grainId: this.args.grain.id });
  }

  <template>
    <DumbGrain
      @hasJustAppeared={{@hasJustAppeared}}
      {{didInsert this.focusAndScroll}}
      @grain={{@grain}}
      @transition={{@transition}}
      @onImageAlternativeTextOpen={{@onImageAlternativeTextOpen}}
      @onVideoTranscriptionOpen={{@onVideoTranscriptionOpen}}
      @onElementAnswer={{@onElementAnswer}}
      @onElementRetry={{@onElementRetry}}
      @onVideoPlay={{@onVideoPlay}}
      @getLastCorrectionForElement={{this.getLastCorrectionForElement}}
      @onFileDownload={{@onFileDownload}}
      @shouldDisplaySkipButton={{this.shouldDisplaySkipButton}}
      @onGrainSkip={{@onGrainSkip}}
      @shouldDisplayContinueButton={{this.shouldDisplayContinueButton}}
      @onGrainContinue={{@onGrainContinue}}
      @shouldDisplayTerminateButton={{@shouldDisplayTerminateButton}}
      @onModuleTerminate={{@onModuleTerminate}}
      @stepperIsFinished={{this.stepperIsFinished}}
      @onStepperNextStep={{@onStepperNextStep}}
      @passage={{@passage}}
    />
  </template>
}
