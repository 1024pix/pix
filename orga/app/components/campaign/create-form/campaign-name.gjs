import PixInput from '@1024pix/pix-ui/components/pix-input';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import displayCampaignErrors from '../../../helpers/display-campaign-errors';
import FormField from '../../ui/form-field';

export default class CampaignName extends Component {
  @action
  onChange(event) {
    this.args.campaign.name = event.target.value;
  }

  <template>
    <FormField>
      <PixInput
        @id="campaign-name"
        @name="campaign-name"
        @requiredLabel={{t "common.form.mandatory-fields-title"}}
        type="text"
        class="input"
        maxlength="255"
        {{on "change" this.onChange}}
        @value={{@campaign.name}}
        required={{true}}
        aria-required={{true}}
      >
        <:label>{{t "pages.campaign-creation.name.label"}}</:label>
      </PixInput>

      {{#if @errors.name}}
        <div class="form__error error-message">
          {{displayCampaignErrors @errors.name}}
        </div>
      {{/if}}
    </FormField>
  </template>
}
