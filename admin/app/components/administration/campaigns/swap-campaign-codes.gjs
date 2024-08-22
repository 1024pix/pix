import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import AdministrationBlockLayout from '../block-layout';

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

  <template>
    <AdministrationBlockLayout @title={{t "components.administration.swap-campaign-codes.title"}}>
      <form {{on "submit" this.swapCodes}}>
        <fieldset class="campaigns-swap-code">
          <legend>{{t "components.administration.swap-campaign-codes.description"}}</legend>
          <PixInput @id="firstCampaignId" {{on "change" (fn this.onChangeCampaign "firstCampaignId")}}>
            <:label>{{t "components.administration.swap-campaign-codes.form.firstCampaignId"}}</:label>
          </PixInput>

          <PixInput @id="secondCampaignId" {{on "change" (fn this.onChangeCampaign "secondCampaignId")}}>
            <:label>{{t "components.administration.swap-campaign-codes.form.secondCampaignId"}}</:label>
          </PixInput>
        </fieldset>
        <PixButton @type="submit" @size="small" @isLoading={{this.isLoading}}>
          {{t "components.administration.swap-campaign-codes.form.button"}}
        </PixButton>
      </form>
    </AdministrationBlockLayout>
  </template>
}
