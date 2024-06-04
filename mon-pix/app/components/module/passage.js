import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import ModuleGrain from './grain.js';

export default class ModulePassage extends Component {
  @service router;
  @service metrics;
  displayableGrains = this.args.module.grains.filter((grain) => ModuleGrain.getSupportedElements(grain).length > 0);
  @tracked grainsToDisplay = this.displayableGrains.length > 0 ? [this.displayableGrains[0]] : [];

  static SCROLL_OFFSET_PX = 70;

  @action
  setGrainScrollOffsetCssProperty(element) {
    element.style.setProperty('--grain-scroll-offset', `${ModulePassage.SCROLL_OFFSET_PX}px`);
  }

  get hasNextGrain() {
    return this.grainsToDisplay.length < this.displayableGrains.length;
  }

  get lastIndex() {
    return this.grainsToDisplay.length - 1;
  }

  @action
  skipToNextGrain() {
    const lastGrain = this.displayableGrains[this.lastIndex];

    this.addNextGrainToDisplay();

    this.metrics.add({
      event: 'custom-event',
      'pix-event-category': 'Modulix',
      'pix-event-action': `Passage du module : ${this.args.module.id}`,
      'pix-event-name': `Click sur le bouton passer du grain : ${lastGrain.id}`,
    });
  }

  @action
  continueToNextGrain() {
    const lastGrain = this.displayableGrains[this.lastIndex];

    this.addNextGrainToDisplay();

    this.metrics.add({
      event: 'custom-event',
      'pix-event-category': 'Modulix',
      'pix-event-action': `Passage du module : ${this.args.module.id}`,
      'pix-event-name': `Click sur le bouton continuer du grain : ${lastGrain.id}`,
    });
  }

  addNextGrainToDisplay() {
    if (!this.hasNextGrain) {
      return;
    }

    const nextGrain = this.displayableGrains[this.lastIndex + 1];
    this.grainsToDisplay = [...this.grainsToDisplay, nextGrain];
  }

  @action
  grainCanMoveToNextGrain(index) {
    return this.lastIndex === index && this.hasNextGrain;
  }

  @action
  grainShouldDisplayTerminateButton(index) {
    return this.lastIndex === index && !this.hasNextGrain;
  }

  @action
  grainTransition(grainId) {
    return this.args.module.transitionTexts.find((transition) => transition.grainId === grainId);
  }

  @action
  hasGrainJustAppeared(index) {
    if (this.grainsToDisplay.length === 1) {
      return false;
    }

    return this.grainsToDisplay.length - 1 === index;
  }

  @action
  terminateModule() {
    this.args.passage.terminate();
    return this.router.transitionTo('module.recap', this.args.module);
  }
}
