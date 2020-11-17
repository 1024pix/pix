import _maxBy from 'lodash/maxBy';
import Component from '@glimmer/component';
import ENV from 'mon-pix/config/environment';

export default class ResumeCampaignBanner extends Component {

  get unsharedCampaignParticipations() {
    return this.args.campaignParticipations.filter((campaignParticipation) => campaignParticipation.isShared === false);
  }

  get lastUnsharedCampaignParticipation() {
    return _maxBy(this.unsharedCampaignParticipations, 'createdAt');
  }

  get showResumeBar() {
    return ENV.APP.IS_PIX_CONTEST !== 'true' ||
      (ENV.APP.IS_PIX_CONTEST === 'true' && !this.campaignParticipationState.assessment.get('isCompleted'));
  }

  get campaignParticipationState() {
    if (this.lastUnsharedCampaignParticipation) {
      return {
        title: this.lastUnsharedCampaignParticipation.campaign.get('title'),
        code: this.lastUnsharedCampaignParticipation.campaign.get('code'),
        isTypeAssessment: this.lastUnsharedCampaignParticipation.campaign.get('isTypeAssessment'),
        assessment: this.lastUnsharedCampaignParticipation.assessment,
      };
    }

    return null;
  }
}
