import { computed } from '@ember/object';
import Component from '@ember/component';

export default class CompetenceCardMobile extends Component {
  scorecard = null;

  @computed('scorecard.{level,isNotStarted}')
  get displayedLevel() {
    if (this.scorecard.isNotStarted) {
      return null;
    }
    return this.scorecard.level;
  }
}
