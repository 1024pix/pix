import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ModuleDetails extends Component {
  @tracked grainsToDisplay = [this.args.module.grains[0]];

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
  grainCanDisplayContinueButton(index) {
    return this.lastIndex === index && this.hasNextGrain;
  }

  @action
  grainTransition(grainId) {
    return this.args.module.transitionTexts.find((transition) => transition.grainId === grainId);
  }
}
