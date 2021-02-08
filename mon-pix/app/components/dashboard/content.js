import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import orderBy from 'lodash/orderBy';

export default class Content extends Component {
  MAX_SCORECARDS_TO_DISPLAY = 4;

  @service currentUser;

  get hasNothingToShow() {
    return !this.hasCampaignParticipationOverviews && !this.hasStartedCompetences && !this.hasRecommendedCompetences;
  }

  get hasCampaignParticipationOverviews() {
    const campaignParticipationOverviews = this.args.model.campaignParticipationOverviews;
    return campaignParticipationOverviews && campaignParticipationOverviews.length > 0;
  }

  get hasRecommendedCompetences() {
    return this.recommendedScorecards.length > 0;
  }

  get hasStartedCompetences() {
    return this.startedCompetences.length > 0;
  }

  get recommendedScorecards() {
    const isScorecardNotStarted = (scorecard) => scorecard.isNotStarted;
    return this._filterScorecardsByStateAndRetrieveTheFirstOnesByIndex(isScorecardNotStarted);
  }

  get startedCompetences() {
    const isScorecardStarted = (scorecard) => scorecard.isStarted;
    return this._filterScorecardsByStateAndRetrieveTheFirstOnesByIndex(isScorecardStarted);
  }

  _filterScorecardsByStateAndRetrieveTheFirstOnesByIndex(state) {
    const scorecards = this.args.model.scorecards;
    const filteredScorecards = scorecards.filter(state);
    const orderedAndFilteredScorecards = orderBy(filteredScorecards, ['index']);
    return orderedAndFilteredScorecards.slice(0, this.MAX_SCORECARDS_TO_DISPLAY);
  }

  get userFirstname() {
    return this.currentUser.user.firstName;
  }

  get hasUserSeenNewDashboardInfo() {
    return this.currentUser.user.hasSeenNewDashboardInfo;
  }

  @action
  async closeInformationAboutNewDashboard() {
    await this.currentUser.user.save({ adapterOptions: { rememberUserHasSeenNewDashboardInfo: true } });
  }
}
