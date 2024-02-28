import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class UpdateCampaignCode extends Component {
  @service intl;
  @service notifications;
  @service store;

  @tracked isLoading;

  @action
  async updateCode(event) {
    event.preventDefault();
    this.isLoading = true;
    this.notifications.clearAll();

    const adapter = this.store.adapterFor('update-campaign-code');
    try {
      await adapter.updateCampaignCode({ campaignId: this.campaignId, campaignCode: this.campaignCode });
      this.notifications.success(this.intl.t('components.administration.update-campaign-code.notifications.success'));
    } catch (errorResponse) {
      const errors = errorResponse.errors;

      if (!errors) {
        return this.notifications.error(this.intl.t('common.notifications.generic-error'));
      } else {
        const error = errors[0];

        if (error.code === 'CAMPAIGN_CODE_BAD_FORMAT') {
          return this.notifications.error(
            this.intl.t('components.administration.update-campaign-code.notifications.error.campaign-code-format'),
          );
        } else if (error.code === 'CAMPAIGN_CODE_NOT_UNIQUE') {
          return this.notifications.error(
            this.intl.t('components.administration.update-campaign-code.notifications.error.unique-code-error'),
          );
        } else if (error.code === 'UNKNOWN_CAMPAIGN_ID') {
          this.notifications.error(
            this.intl.t('components.administration.update-campaign-code.notifications.error.campaign-id-error'),
          );
        } else {
          this.notifications.error(this.intl.t('common.notifications.generic-error'));
        }
      }
    } finally {
      this.isLoading = false;
    }
  }

  @action
  onChangeCampaignId(event) {
    this.campaignId = event.target.value;
  }
  @action
  onChangeCampaignCode(event) {
    this.campaignCode = event.target.value;
  }
}
