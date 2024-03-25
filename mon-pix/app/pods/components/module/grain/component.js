import { action } from '@ember/object';
import Component from '@glimmer/component';

import ModulePassage from '../passage/component';

export default class ModuleGrain extends Component {
  grain = this.args.grain;

  @action
  getLastCorrectionForElement(element) {
    return this.args.passage.getLastCorrectionForElement(element);
  }

  get shouldDisplayContinueButton() {
    return this.args.canMoveToNextGrain && this.allElementsAreAnswered;
  }

  get shouldDisplaySkipButton() {
    return this.args.canMoveToNextGrain && this.hasAnswerableElements && !this.allElementsAreAnswered;
  }

  get displayableElements() {
    return this.args.grain.supportedElements;
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
      return !!this.args.passage.getLastCorrectionForElement(element);
    });
  }

  @action
  focusAndScroll(element) {
    if (!this.args.hasJustAppeared) {
      return;
    }

    element.focus({ preventScroll: true });

    const newGrainY = element.getBoundingClientRect().top + window.scrollY;
    const userPrefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    window.scroll({
      top: newGrainY - ModulePassage.SCROLL_OFFSET_PX,
      behavior: userPrefersReducedMotion.matches ? 'instant' : 'smooth',
    });
  }

  @action
  terminateAction() {
    this.args.terminateAction();
  }
}
