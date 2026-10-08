import { PixButton } from '@1024pix/nebulix-ember';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import ENV from 'pix-orga/config/environment';

export default class SelectionCampaignLti extends Component {
  @service requestManager;

  @action async selectCampaign() {
    const response = await this.requestManager.request({
      url: `${ENV.APP.API_HOST}/api/lti/select-campaign`,
      method: 'POST',
      body: JSON.stringify({
        campaignCode: 'AUTOCOUR1',
      }),
    });

    const { deepLinkingResponse, deepLinkingResponseEndpoint } = response.content;

    document.querySelector('#deepLinkingResponse').value = deepLinkingResponse;

    const form = document.querySelector('#deepLinkingForm');
    form.action = deepLinkingResponseEndpoint;
    form.submit();
  }

  get buttonText() {
    return 'OK';
  }

  <template>
    <form id="deepLinkingForm" method="POST" enctype="application/x-www-form-urlencoded">
      <input type="hidden" id="deepLinkingResponse" name="JWT" />
    </form>
    <PixButton @triggerAction={{this.selectCampaign}}>
      {{this.buttonText}}
    </PixButton>
  </template>
}
