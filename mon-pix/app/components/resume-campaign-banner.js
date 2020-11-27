import _maxBy from 'lodash/maxBy';
import Component from '@glimmer/component';
import ENV from 'mon-pix/config/environment';
import { inject as service } from '@ember/service';

export default class ResumeCampaignBanner extends Component {

  @service currentUser;

  get notFinishedCampaignParticipations() {
    if (ENV.APP.IS_PIX_CONTEST === 'true') {
      return this.args.campaignParticipations.filter((campaignParticipation) => !campaignParticipation.assessment.get('isCompleted'));
    }
    return this.args.campaignParticipations.filter((campaignParticipation) => campaignParticipation.isShared === false);
  }

  get lastNotFinishedCampaignParticipation() {
    return _maxBy(this.notFinishedCampaignParticipations, 'createdAt');
  }

  get showResumeBar() {
    if (ENV.APP.IS_PIX_CONTEST !== 'true') {
      return true;
    }
    if (this.currentUser.user.finishedPixContestAt) {
      return false;
    }
    if (!this.campaignParticipationState.assessment.get('isCompleted')) {
      return true;
    }
    return false;
  }

  get campaignParticipationState() {
    if (this.lastNotFinishedCampaignParticipation) {
      return {
        title: this.lastNotFinishedCampaignParticipation.campaign.get('title'),
        code: this.lastNotFinishedCampaignParticipation.campaign.get('code'),
        isTypeAssessment: this.lastNotFinishedCampaignParticipation.campaign.get('isTypeAssessment'),
        assessment: this.lastNotFinishedCampaignParticipation.assessment,
      };
    }

    return null;
  }
}
