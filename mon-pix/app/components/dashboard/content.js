import Component from '@glimmer/component';
import orderBy from 'lodash/orderBy';

export default class Content extends Component {
  MAX_SCORECARDS_TO_DISPLAY = 4;

  get hasCampaignParticipationOverviews() {
    const campaignParticipationOverviews = this.args.model.campaignParticipationOverviews;
    return campaignParticipationOverviews && campaignParticipationOverviews.length > 0;
  }

  get hasRecommendedCompetences() {
    const scorecards = this.args.model.scorecards;
    return scorecards && scorecards.length > 0;
  }

  get recommendedScorecards() {
    const scorecards = this.args.model.scorecards;
    const filteredScorecards = scorecards.filter((scorecard) => scorecard.isNotStarted);
    const orderedAndFilteredScorecards = orderBy(filteredScorecards, ['index']);
    return orderedAndFilteredScorecards.slice(0, this.MAX_SCORECARDS_TO_DISPLAY);
  }
}
