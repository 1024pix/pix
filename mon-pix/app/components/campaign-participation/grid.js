import Component from '@glimmer/component';

export default class Grid extends Component {
  get campaignParticipations() {
    return this.args.model.filter((campaignParticipation) => {
      return campaignParticipation.get('campaign.isTypeAssessment') && !campaignParticipation.isShared;
    });
  }
}
