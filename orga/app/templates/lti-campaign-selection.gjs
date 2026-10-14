import { PixButton, PixInput } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import ENV from 'pix-orga/config/environment';

export default class SelectionCampaignLti extends Component {
  @service requestManager;

  @tracked campaignCode = 'AUTOCOUR1';

  @action async selectCampaign() {
    const response = await this.requestManager.request({
      url: `${ENV.APP.API_HOST}/api/lti/select-campaign`,
      method: 'POST',
      body: JSON.stringify({
        campaignCode: this.campaignCode,
      }),
    });

    const { deepLinkingResponse, deepLinkingResponseEndpoint } = response.content;

    document.querySelector('#deepLinkingResponse').value = deepLinkingResponse;

    const form = document.querySelector('#deepLinkingForm');
    form.action = deepLinkingResponseEndpoint;
    form.submit();
  }

  @action setCampaignCode(event) {
    this.campaignCode = event.target.value;
  }

  get buttonText() {
    return 'OK';
  }
  get campaignCodeText() {
    return 'Campaign code';
  }

  <template>
    <form id="deepLinkingForm" method="POST" enctype="application/x-www-form-urlencoded">
      <input type="hidden" id="deepLinkingResponse" name="JWT" />
    </form>
    <PixInput
      value={{this.campaignCode}}
      {{on "change" this.setCampaignCode}}
      @requiredLabel={{t "common.fields.required-field"}}
    >
      <:label>{{this.campaignCodeText}}</:label>
    </PixInput>
    <PixButton @triggerAction={{this.selectCampaign}}>
      {{this.buttonText}}
    </PixButton>
  </template>
}
