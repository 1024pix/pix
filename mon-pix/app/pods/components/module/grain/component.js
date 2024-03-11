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
    return this.args.canMoveToNextGrain && this.grain.hasAnswerableElements && !this.allElementsAreAnswered;
  }

  get allElementsAreAnswered() {
    return this.grain.allElementsAreAnsweredForPassage(this.args.passage);
  }

  get ariaLiveGrainValue() {
    return this.args.hasJustAppeared ? 'assertive' : null;
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
