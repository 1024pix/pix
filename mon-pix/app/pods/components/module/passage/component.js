import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class ModulePassage extends Component {
  @service router;
  @tracked grainsToDisplay = [this.args.module.grains[0]];
  static SCROLL_OFFSET_PX = 70;

  @action
  setGrainScrollOffsetCssProperty(element) {
    element.style.setProperty('--grain-scroll-offset', `${ModulePassage.SCROLL_OFFSET_PX}px`);
  }

  get hasNextGrain() {
    return this.grainsToDisplay.length < this.args.module.grains.length;
  }

  get lastIndex() {
    return this.grainsToDisplay.length - 1;
  }

  @action
  addNextGrainToDisplay() {
    if (!this.hasNextGrain) {
      return;
    }

    const nextGrain = this.args.module.grains[this.lastIndex + 1];
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
    return this.router.transitionTo('module.recap', this.args.module);
  }
}
