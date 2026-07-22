import PixTextarea from '@1024pix/pix-ui/components/pix-textarea';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import FormField from '../../ui/form-field';

export default class LandingPageText extends Component {
  @action
  onChange(event) {
    this.args.campaign.customLandingPageText = event.target.value;
  }

  <template>
    <FormField>
      <PixTextarea
        @id="custom-landing-page-text"
        @maxlength="5000"
        @value={{@campaign.customLandingPageText}}
        @subLabel={{t "pages.campaign-creation.landing-page-text.sublabel"}}
        {{on "change" this.onChange}}
        rows="8"
      >
        <:label>{{t "pages.campaign-creation.landing-page-text.label"}}</:label>
      </PixTextarea>
    </FormField>
  </template>
}
