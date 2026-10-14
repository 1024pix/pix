import { PixButton, PixInput } from '@1024pix/nebulix-ember';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

export default class SelectionCampaignLti extends Component {
  @tracked campaignCode = 'AUTOCOUR1';

  get buttonText() {
    return 'OK';
  }
  get campaignCodeText() {
    return 'Campaign code';
  }

  <template>
    <form method="POST" action="/api/lti/select-campaign" enctype="application/x-www-form-urlencoded">
      <PixInput name="campaignCode" value="AUTOCOUR1" @requiredLabel={{t "common.fields.required-field"}}>
        <:label>{{this.campaignCodeText}}</:label>
      </PixInput>
      <PixButton type="submit">
        {{this.buttonText}}
      </PixButton>
    </form>
  </template>
}
