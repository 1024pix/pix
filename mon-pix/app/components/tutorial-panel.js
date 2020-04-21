import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class TutorialPanel extends Component {
  @tracked hint = null;
  @tracked tutorials = null;

  get shouldDisplayHintOrTuto() {
    const tutorials = this.args.tutorials || [];
    const hint = this.args.hint || [];

    return (hint.length > 0) || (tutorials.length > 0);
  }

  get shouldDisplayHint() {
    const hint = this.args.hint || [];
    return hint.length > 0;
  }

  get shouldDisplayTutorial() {
    const tutorials = this.args.tutorials || [];
    return tutorials.length > 0;
  }

  get limitedTutorials() {
    return this.args.tutorials.slice(0, 3);
  }
}
