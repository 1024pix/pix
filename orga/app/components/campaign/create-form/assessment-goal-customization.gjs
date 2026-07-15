import PixInput from '@1024pix/pix-ui/components/pix-input';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import FormField from '../../ui/form-field';
import LandingPageText from './landing-page-text';

export default class AssessmentGoalCustomization extends Component {
  @action
  onChangeCampaignTitle(event) {
    this.args.campaign.title = event.target.value;
  }

  <template>
    <FormField>
      <PixInput
        @id="campaign-title"
        @name="campaign-title"
        @subLabel={{t "pages.campaign-creation.test-title.sublabel"}}
        maxlength="50"
        {{on "change" this.onChangeCampaignTitle}}
        @value={{@campaign.title}}
      >
        <:label>{{t "pages.campaign-creation.test-title.label"}}</:label></PixInput>
    </FormField>

    <LandingPageText @campaign={{@campaign}} />
  </template>
}
