import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import ModulePassage from '../passage/component';

export default class ModuleGrain extends Component {
  @service metrics;
  grain = this.args.grain;

  get shouldDisplayContinueButton() {
    return this.args.canMoveToNextGrain && this.allElementsAreAnswered;
  }

  get shouldDisplaySkipButton() {
    return this.args.canMoveToNextGrain && this.grain.hasAnswerableElements && !this.allElementsAreAnswered;
  }

  get allElementsAreAnswered() {
    return this.grain.allElementsAreAnswered;
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
  async continueAction() {
    await this.args.continueAction();
    this.metrics.add({
      event: 'custom-event',
      'pix-event-category': 'Modulix',
      'pix-event-action': `Passage du module : ${this.grain.module.id}`,
      'pix-event-name': `Click sur le bouton continuer du grain : ${this.grain.id}`,
    });
  }

  @action
  skipAction() {
    this.args.skipAction();
    this.metrics.add({
      event: 'custom-event',
      'pix-event-category': 'Modulix',
      'pix-event-action': `Passage du module : ${this.grain.module.id}`,
      'pix-event-name': `Click sur le bouton passer du grain : ${this.grain.id}`,
    });
  }
}
