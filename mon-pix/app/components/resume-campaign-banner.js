import _maxBy from 'lodash/maxBy';
import Component from '@glimmer/component';

export default class ResumeCampaignBanner extends Component {

  get unsharedCampaignParticipations() {
    return this.args.campaignParticipations.filter((campaignParticipation) => campaignParticipation.isShared === false);
  }

  get lastUnsharedCampaignParticipation() {
    return _maxBy(this.unsharedCampaignParticipations, 'createdAt');
  }

  get campaignParticipationState() {
    if (this.lastUnsharedCampaignParticipation) {
      return {
        title: this.lastUnsharedCampaignParticipation.campaign.get('title'),
        code: this.lastUnsharedCampaignParticipation.campaign.get('code'),
        isTypeAssessment: this.lastUnsharedCampaignParticipation.campaign.get('isAssessment'),
        assessment: this.lastUnsharedCampaignParticipation.assessment,
      };
    }

    return null;
  }
}
