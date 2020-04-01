import { classNames } from '@ember-decorators/component';
import { computed } from '@ember/object';
import Component from '@ember/component';
import classic from 'ember-classic-decorator';

@classic
@classNames('tutorial-panel')
export default class TutorialPanel extends Component {
  hint = null;
  tutorials = null;

  @computed('tutorials', 'hint')
  get shouldDisplayHintOrTuto() {
    const tutorials = this.tutorials || [];
    const hint = this.hint || [];

    return (hint.length > 0) || (tutorials.length > 0);
  }

  @computed('hint')
  get shouldDisplayHint() {
    const hint = this.hint || [];
    return hint.length > 0;
  }

  @computed('tutorials')
  get shouldDisplayTutorial() {
    const tutorials = this.tutorials || [];
    return tutorials.length > 0;
  }

  @computed('tutorials')
  get limitedTutorials() {
    return this.tutorials.slice(0, 3);
  }
}
