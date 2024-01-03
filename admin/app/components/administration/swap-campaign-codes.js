import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class SwapCampaignCodes extends Component {
  @service intl;
  @service notifications;
  @service store;

  @tracked isLoading;

  @action
  async swapCodes(event) {
    event.preventDefault();
    this.isLoading = true;
    this.notifications.clearAll();

    const adapter = this.store.adapterFor('swap-campaign-code');
    try {
      await adapter.swap({ firstCampaignId: this.firstCampaignId, secondCampaignId: this.secondCampaignId });
      this.notifications.success(this.intl.t('components.administration.swap-campaign-codes.notifications.success'));
    } catch (errorResponse) {
      const errors = errorResponse.errors;

      if (!errors) {
        return this.notifications.error(this.intl.t('common.notifications.generic-error'));
      } else {
        const error = errors[0];

        if (error.code === 'ORGANIZATION_MISMATCH') {
          return this.notifications.error(
            this.intl.t('components.administration.swap-campaign-codes.notifications.error.mismatch-organization'),
          );
        } else if (error.code === 'UNKNOWN_CAMPAIGN_ID') {
          this.notifications.error(
            this.intl.t('components.administration.swap-campaign-codes.notifications.error.swap-code-error'),
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
  onChangeCampaign(key, event) {
    this[key] = event.target.value;
  }
}
