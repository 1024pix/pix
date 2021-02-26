import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class CompetenceCardMobile extends Component {
  @service ariaLabels;

  get scoreAriaLabel() {
    return this.ariaLabels.computeScoreAriaLabel({
      isNotStarted: this.args.scorecard.isNotStarted,
      currentLevel: this.displayedLevel,
      percentageAheadOfNextLevel: this.args.scorecard.percentageAheadOfNextLevel,
    });
  }

  get displayedLevel() {
    if (this.args.scorecard.isNotStarted) {
      return null;
    }
    return this.args.scorecard.level;
  }
}
