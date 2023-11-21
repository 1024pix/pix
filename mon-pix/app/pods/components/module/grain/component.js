import Component from '@glimmer/component';

export default class ModuleGrain extends Component {
  get shouldDisplayContinueButton() {
    return this.args.shouldDisplayContinueButton && this.allElementsAreAnswered;
  }

  get allElementsAreAnswered() {
    return this.args.grain.allElementsAreAnswered;
  }
}
