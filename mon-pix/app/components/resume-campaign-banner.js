import _maxBy from 'lodash/maxBy';
import Component from '@glimmer/component';

export default class ResumeCampaignBanner extends Component {

  get unsharedProfileCollectionCampaignParticipations() {
    return this.args.campaignParticipations.filter((campaignParticipation) => campaignParticipation.isShared === false
      && campaignParticipation.campaign.get('isProfilesCollection'));
  }

  get participationToContinue() {
    return _maxBy(this.unsharedProfileCollectionCampaignParticipations, 'createdAt');
  }

  get campaignParticipationState() {
    if (this.participationToContinue) {
      return {
        code: this.participationToContinue.campaign.get('code'),
        isProfilesCollection: this.participationToContinue.campaign.get('isProfilesCollection'),
      };
    }

    return null;
  }
}
