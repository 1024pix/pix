import Component from '@glimmer/component';

export default class CompetenceCardDefault extends Component {
  get displayedLevel() {
    if (this.args.scorecard.isNotStarted) {
      return null;
    }
    return this.args.scorecard.level;
  }
}
