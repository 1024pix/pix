import Component from '@glimmer/component';

export default class Grid extends Component {
  get filteredCampaignParticipations() {
    return this.args.model.filter((campaignParticipation) => {
      return campaignParticipation.get('campaign.isAssessment') && !campaignParticipation.isShared;
    }).slice(0, 9);
  }
}
