import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import orderBy from 'lodash/orderBy';
import _maxBy from 'lodash/maxBy';

export default class Content extends Component {
  MAX_SCORECARDS_TO_DISPLAY = 4;

  @service currentUser;
  @service url;
  @service intl;

  get hasNothingToShow() {
    return !this.hasCampaignParticipationOverviews && !this.hasStartedCompetences && !this.hasRecommendedCompetences;
  }

  get profileCollectionCampaignParticipationCode() {
    const unsharedProfileCollectionCampaignParticipations = this.args.model.campaignParticipations.filter((campaignParticipation) =>
      !campaignParticipation.isShared
      && campaignParticipation.campaign.get('isProfilesCollection'));

    if (unsharedProfileCollectionCampaignParticipations && unsharedProfileCollectionCampaignParticipations.length > 0) {
      const latestParticipationToContinue = _maxBy(unsharedProfileCollectionCampaignParticipations, 'createdAt');
      return latestParticipationToContinue.campaign.get('code');
    }
    return null;
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

  get userScore() {
    return this.currentUser.user.profile.pixScore;
  }

  @action
  async closeInformationAboutNewDashboard() {
    await this.currentUser.user.save({ adapterOptions: { rememberUserHasSeenNewDashboardInfo: true } });
  }

  get newDashboardInfoLink() {
    return {
      text: this.url.isFrenchDomainExtension ? this.intl.t('pages.dashboard.presentation.link.text') : null,
      url: this.url.isFrenchDomainExtension ? this.intl.t('pages.dashboard.presentation.link.url') : null,
    };
  }
}
