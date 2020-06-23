import Component from '@glimmer/component';
import config from 'mon-pix/config/environment';

export default class CompetenceCardDefault extends Component {
  get displayImproveButton() {
    return config.APP.FT_IMPROVE_COMPETENCE_EVALUATION;
  }

  get displayedLevel() {
    if (this.args.scorecard.isNotStarted) {
      return null;
    }
    return this.args.scorecard.level;
  }
}
