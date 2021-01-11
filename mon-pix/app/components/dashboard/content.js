import Component from '@glimmer/component';

export default class Content extends Component {
  get hasCampaignParticipationOverviews() {
    return this.args.model.campaignParticipationOverviews
      && this.args.model.campaignParticipationOverviews.length > 0;
  }

  get hasRecommendedCompetences() {
    return this.args.model.scorecards && this.args.model.scorecards.length > 0;
  }
}
