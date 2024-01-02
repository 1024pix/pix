import { service } from '@ember/service';
import Component from '@glimmer/component';
import { action } from '@ember/object';
export default class CampaignTabs extends Component {
  @service intl;
  @service notifications;
  @service fileSaver;
  @service session;

  @action
  async exportData() {
    try {
      const token = this.session.data.authenticated.access_token;
      await this.fileSaver.save({ url: this.args.campaign.urlToResult, token });
    } catch (err) {
      this.notifications.sendError(this.intl.t('api-error-messages.global'));
    }
  }
}
