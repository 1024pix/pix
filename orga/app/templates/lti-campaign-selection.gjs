import { PixButton, PixSelect } from '@1024pix/nebulix-ember';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class SelectionCampaignLti extends Component {
  @tracked campaignCode;
  @tracked campaignCodeError;

  @action
  setCampaignCode(value) {
    this.campaignCode = value;
    this.campaignCodeError = undefined;
  }

  @action noop() {}

  @action validate(event) {
    if (this.campaignCode != undefined) return;

    event.preventDefault();
    this.campaignCodeError = 'Veuillez sélectionner une campagne';
  }

  get buttonText() {
    return 'OK';
  }

  get campaignCodeText() {
    return 'Campaign code';
  }

  get campaignOptions() {
    return this.args.model.map((campaign) => {
      return {
        label: campaign.name,
        value: campaign.code,
      };
    });
  }

  <template>
    <form method="POST" action="/api/lti/select-campaign" {{on "submit" this.validate}}>
      <PixSelect
        @options={{this.campaignOptions}}
        @value={{this.campaignCode}}
        @onChange={{this.setCampaignCode}}
        @hideDefaultOption={{true}}
        @errorMessage={{this.campaignCodeError}}
      >
        <:label>{{this.campaignCodeText}}</:label>
      </PixSelect>
      <input type="hidden" name="campaignCode" value={{this.campaignCode}} />
      <PixButton type="submit" @triggerAction={{this.noop}}>
        {{this.buttonText}}
      </PixButton>
    </form>
  </template>
}
