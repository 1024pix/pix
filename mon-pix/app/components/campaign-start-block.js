import { action } from '@ember/object';
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class CampaignStartBlock extends Component {
  @service currentUser;
  @service session;
  @service intl;

  get showWarningMessage() {
    return this.session.isAuthenticated && !this.currentUser.user.isAnonymous;
  }

  get campaignType() {
    return this.args.campaign.isAssessment ? 'assessment' : 'profiles-collection';
  }

  get titleText() {
    if (this.showWarningMessage) {
      return this.intl.t(`pages.campaign-landing.${this.campaignType}.title-with-username`, {
        userFirstName: this.currentUser.user.firstName,
        htmlSafe: true,
      });
    } else {
      return this.intl.t(`pages.campaign-landing.${this.campaignType}.title`, {
        htmlSafe: true,
      });
    }
  }

  get buttonText() {
    return this.intl.t(`pages.campaign-landing.${this.campaignType}.action`);
  }

  get announcementText() {
    return this.intl.t(`pages.campaign-landing.${this.campaignType}.announcement`);
  }

  get legalText() {
    return this.intl.t(`pages.campaign-landing.${this.campaignType}.legal`);
  }

  get warningMessage() {
    return this.intl.t('pages.campaign-landing.warning-message', {
      firstName: this.currentUser.user.firstName,
      lastName: this.currentUser.user.lastName,
    });
  }

  @action
  disconnect() {
    this.session.invalidate();
  }

  @action
  start(event) {
    event.preventDefault();
    this.args.startCampaignParticipation();
  }
}
