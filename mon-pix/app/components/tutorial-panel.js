import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class TutorialPanel extends Component {
  @service featureToggles;

  get shouldDisplayHintOrTuto() {
    const tutorials = this.args.tutorials || [];
    const hint = this.args.hint || [];

    return hint.length > 0 || tutorials.length > 0;
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
