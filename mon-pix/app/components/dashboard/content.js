import Component from '@glimmer/component';

export default class Content extends Component {
  get hasCampaignParticipationOverviews() {
    const campaignParticipationOverviews = this.args.model.campaignParticipationOverviews;
    return campaignParticipationOverviews && campaignParticipationOverviews.length > 0;
  }

  get hasRecommendedCompetences() {
    const scorecards = this.args.model.scorecards;
    return scorecards && scorecards.length > 0;
  }
}
