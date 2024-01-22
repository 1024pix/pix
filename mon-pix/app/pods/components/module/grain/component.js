import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import ModuleDetails from '../details/component';

export default class ModuleGrain extends Component {
  @service metrics;

  get shouldDisplayContinueButton() {
    return this.args.canDisplayContinueButton && this.allElementsAreAnswered;
  }

  get shouldDisplaySkipButton() {
    return this.args.grain.hasAnswerableElements && !this.allElementsAreAnswered;
  }

  get allElementsAreAnswered() {
    return this.args.grain.allElementsAreAnswered;
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
      top: newGrainY - ModuleDetails.SCROLL_OFFSET_PX,
      behavior: userPrefersReducedMotion.matches ? 'instant' : 'smooth',
    });
  }

  @action
  async continueAction() {
    await this.args.continueAction();
    this.metrics.add({
      event: 'custom-event',
      'pix-event-category': 'Modulix',
      'pix-event-action': `Passage du module : ${this.args.grain.module.id}`,
      'pix-event-name': `Click sur le bouton continuer du grain : ${this.args.grain.id}`,
    });
  }

  @action
  skipAction() {
    this.args.skipAction();
    this.metrics.add({
      event: 'custom-event',
      'pix-event-category': 'Modulix',
      'pix-event-action': `Passage du module : ${this.args.grain.module.id}`,
      'pix-event-name': `Click sur le bouton passer du grain : ${this.args.grain.id}`,
    });
  }
}
