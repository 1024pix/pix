import Component from '@glimmer/component';
export default class AssessmentList extends Component {
  get displayParticipationCount() {
    return this.args.campaign.multipleSendings;
  }
}
