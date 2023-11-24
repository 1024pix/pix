import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ModuleGrain extends Component {
  @service metrics;

  get shouldDisplayContinueButton() {
    return this.args.canDisplayContinueButton && this.allElementsAreAnswered;
  }

  get allElementsAreAnswered() {
    return this.args.grain.allElementsAreAnswered;
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
}
