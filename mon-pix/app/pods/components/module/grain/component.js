import Component from '@glimmer/component';

export default class ModuleGrain extends Component {
  get shouldDisplayContinueButton() {
    return this.args.canDisplayContinueButton && this.allElementsAreAnswered;
  }

  get allElementsAreAnswered() {
    return this.args.grain.allElementsAreAnswered;
  }
}
