import { computed } from '@ember/object';
import Component from '@ember/component';
import classic from 'ember-classic-decorator';

@classic
export default class CompetenceCard extends Component {
  scorecard = null;

  @computed('scorecard.{level,isNotStarted}')
  get displayedLevel() {
    if (this.scorecard.isNotStarted) {
      return null;
    }
    return this.scorecard.level;
  }
}
