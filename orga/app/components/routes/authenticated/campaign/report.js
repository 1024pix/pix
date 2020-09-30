import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class Report extends Component {

  @service store;
  @service notifications;

  get participationsCount() {
    const participationsCount = this.args.campaign.campaignReport.get('participationsCount');

    return participationsCount > 0 ? participationsCount : '-';
  }

  get sharedParticipationsCount() {
    const sharedParticipationsCount = this.args.campaign.campaignReport.get('sharedParticipationsCount');

    return sharedParticipationsCount > 0 ? sharedParticipationsCount : '-';
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
}
