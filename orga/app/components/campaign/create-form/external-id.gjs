import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixRadioButton from '@1024pix/pix-ui/components/pix-radio-button';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { eq, not } from 'ember-truth-helpers';
import { ID_PIX_TYPES } from 'pix-orga/helpers/id-pix-types.js';

import displayCampaignErrors from '../../../helpers/display-campaign-errors';
import FormField from '../../ui/form-field';
import PixFieldset from '../../ui/pix-fieldset';

export default class ExternalId extends Component {
  @tracked wantIdPix = Boolean(this.args.campaign.externalIdLabel);

  get isExternalIdSelectedChecked() {
    return this.wantIdPix === true;
  }

  @action
  askLabelIdPix() {
    this.wantIdPix = true;
    this.args.campaign.externalIdLabel = '';
    this.args.campaign.externalIdType = '';
  }

  @action
  doNotAskLabelIdPix() {
    this.wantIdPix = false;
    this.args.campaign.externalIdLabel = null;
    this.args.campaign.externalIdType = '';
  }

  @action
  onChangeExternalIdType(event) {
    this.args.campaign.externalIdType = event.target.value;
  }

  @action
  onChangeExternalIdLabel(event) {
    this.args.campaign.externalIdLabel = event.target.value;
  }

  <template>
    <FormField>
      <PixFieldset aria-labelledby="external-ids-label" role="radiogroup">
        <:title>{{t "pages.campaign-creation.external-id-label.question-label"}}</:title>
        <:content>
          <PixRadioButton
            name="external-id-label"
            @value="false"
            {{on "change" this.doNotAskLabelIdPix}}
            checked={{not this.isExternalIdSelectedChecked}}
          >
            <:label>{{t "pages.campaign-creation.no"}}</:label>
          </PixRadioButton>
          <PixRadioButton
            name="external-id-label"
            @value="true"
            {{on "change" this.askLabelIdPix}}
            checked={{this.isExternalIdSelectedChecked}}
          >
            <:label>{{t "pages.campaign-creation.yes"}}</:label>
          </PixRadioButton>
        </:content>
      </PixFieldset>
    </FormField>

    {{#if this.wantIdPix}}
      <FormField>
        <PixFieldset @required={{true}} aria-labelledby="external-ids-types" role="radiogroup">
          <:title>{{t "pages.campaign-creation.external-id-type.question-label"}}</:title>
          <:content>
            <PixRadioButton
              name="external-id-types"
              @value="EMAIL"
              {{on "change" this.onChangeExternalIdType}}
              checked={{eq @campaign.externalIdType "EMAIL"}}
            >
              <:label>{{t ID_PIX_TYPES.EMAIL}}</:label>

            </PixRadioButton>
            <PixRadioButton
              name="external-id-types"
              @value="STRING"
              {{on "change" this.onChangeExternalIdType}}
              checked={{eq @campaign.externalIdType "STRING"}}
            >
              <:label>{{t ID_PIX_TYPES.STRING}}</:label>
            </PixRadioButton>
            {{#if @errors.externalIdType}}
              <div class="form__error error-message">
                {{displayCampaignErrors @errors.externalIdType}}
              </div>
            {{/if}}
          </:content>
        </PixFieldset>
      </FormField>
      <FormField>
        <PixInput
          @id="external-id-label"
          @name="external-id-label"
          @subLabel={{t "pages.campaign-creation.external-id-label.suggestion"}}
          maxlength="255"
          @requiredLabel={{t "pages.campaign-creation.external-id-label.required"}}
          {{on "change" this.onChangeExternalIdLabel}}
          @value={{@campaign.externalIdLabel}}
        >
          <:label>{{t "pages.campaign-creation.external-id-label.label"}}</:label>
        </PixInput>

        {{#if @errors.externalIdLabel}}
          <div class="form__error error-message">
            {{displayCampaignErrors @errors.externalIdLabel}}
          </div>
        {{/if}}
      </FormField>

      <div class="gdpr-information-external-id">
        {{t "pages.campaign-creation.legal-warning"}}
      </div>
    {{/if}}
  </template>
}
