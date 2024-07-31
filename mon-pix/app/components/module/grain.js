import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class ModuleGrain extends Component {
  @service modulixAutoScroll;

  grain = this.args.grain;

  static AVAILABLE_ELEMENT_TYPES = ['text', 'image', 'video', 'embed', 'qcu', 'qcm', 'qrocm'];
  static AVAILABLE_GRAIN_TYPES = ['lesson', 'activity'];

  @tracked isStepperFinished = this.hasStepper === false;

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
      return this.args.passage.hasAnswerAlreadyBeenVerified(element);
    });
  }

  @action
  focusAndScroll(htmlElement) {
    if (!this.args.hasJustAppeared) {
      return;
    }

    this.modulixAutoScroll.focusAndScroll(htmlElement);
  }

  @action
  terminateAction() {
    this.args.terminateAction({ grainId: this.args.grain.id });
  }
}
