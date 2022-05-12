import Component from '@glimmer/component';

export default class AssessmentRow extends Component {
  get valuePercentage() {
    return Math.round(this.args.participation.masteryRate * 100);
  }
}
