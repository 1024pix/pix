import Component from '@glimmer/component';

export default class Grid extends Component {
  get filteredCampaignParticipations() {
    return this.args.model.filter((campaignParticipation) => {
      return campaignParticipation.get('campaign.isTypeAssessment') && !campaignParticipation.isShared;
    }).slice(0, 9);
  }
}
