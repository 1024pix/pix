import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class CampaignArchivedBanner extends Component {
  @service store;
  @service notifications;
  @service intl;

  @action
  async unarchiveCampaign() {
    try {
      const campaign = this.store.peekRecord('campaign', this.args.campaign.id);
      await campaign.unarchive();
    } catch (err) {
      this.notifications.error(this.intl.t('api-errors-messages.global'));
    }
  }
}
