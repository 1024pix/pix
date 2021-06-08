import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
export default class Report extends Component {

  @service store;
  @service notifications;
  @service currentUser;
  @service intl;

  @tracked tooltipText = this.intl.t('pages.campaign-details.actions.copy-code');

  get participationsCount() {
    const participationsCount = this.args.campaign.participationsCount;

    return participationsCount > 0 ? participationsCount : false;
  }

  get sharedParticipationsCount() {
    const sharedParticipationsCount = this.args.campaign.sharedParticipationsCount;

    return sharedParticipationsCount > 0 ? sharedParticipationsCount : '-';
  }

  get downloadUrl() {
    return this.args.campaign.urlToResult + `&lang=${this.currentUser.prescriber.lang}`;
  }

  get creatorName() {
    return this.args.campaign.creatorFullName;
  }

  get creationDate() {
    return this.args.campaign.createdAt;
  }

  @action
  async unarchiveCampaign(campaignId) {
    try {
      const campaign = this.store.peekRecord('campaign', campaignId);
      await campaign.unarchive();
    } catch (err) {
      this.notifications.error('Une erreur est survenue');
    }
  }

  @action
  clipboardSuccess() {
    this.tooltipText = this.intl.t('pages.campaign-details.actions.copied');
  }

  @action
  clipboardOut() {
    this.tooltipText = this.intl.t('pages.campaign-details.actions.copy-code');
  }
}
