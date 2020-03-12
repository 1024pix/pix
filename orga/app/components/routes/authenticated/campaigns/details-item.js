import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';

export default class DetailsItem extends Component {

  @service store;
  @service notifications;

  @computed('campaign.campaignReport.participationsCount')
  get participationsCount() {
    const participationsCount = this.get('campaign.campaignReport.participationsCount');

    return participationsCount > 0 ? participationsCount : '-';
  }

  @computed('campaign.campaignReport.sharedParticipationsCount')
  get sharedParticipationsCount() {
    const sharedParticipationsCount = this.get('campaign.campaignReport.sharedParticipationsCount');

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
