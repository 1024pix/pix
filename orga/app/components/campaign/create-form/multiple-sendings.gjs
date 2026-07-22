import PixRadioButton from '@1024pix/pix-ui/components/pix-radio-button';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import { not } from 'ember-truth-helpers';

import ExplanationCard from '../../ui/explanation-card';
import FormField from '../../ui/form-field';
import PixFieldset from '../../ui/pix-fieldset';

export default class MultipleSendings extends Component {
  @action
  selectMultipleSendingsStatus(value) {
    this.args.campaign.multipleSendings = value;
  }

  <template>
    <FormField>
      <:default>
        <PixFieldset @required={{true}} aria-labelledby="multiple-sendings-label" role="radiogroup">
          <:title>{{t @labelKey}}</:title>
          <:content>
            <PixRadioButton
              name="multiple-sendings-label"
              @value="false"
              {{on "change" (fn this.selectMultipleSendingsStatus false)}}
              aria-describedby="multiple-sendings-info"
              checked={{not @campaign.multipleSendings}}
            >
              <:label>{{t "pages.campaign-creation.no"}}</:label>
            </PixRadioButton>

            <PixRadioButton
              name="multiple-sendings-label"
              @value="true"
              {{on "change" (fn this.selectMultipleSendingsStatus true)}}
              aria-describedby="multiple-sendings-info"
              checked={{@campaign.multipleSendings}}
            >
              <:label>{{t "pages.campaign-creation.yes"}}</:label>
            </PixRadioButton>
          </:content>
        </PixFieldset>
      </:default>
      <:information>
        <ExplanationCard id="multiple-sendings-info">
          <:title>{{t "pages.campaign-creation.multiple-sendings.info-title"}}</:title>

          <:message>
            {{t @infoKey}}
            {{#if @campaign.targetProfile.areKnowledgeElementsResettable}}
              {{t "pages.campaign-creation.multiple-sendings.knowledge-elements-resettable"}}
            {{/if}}
          </:message>
        </ExplanationCard>
      </:information>
    </FormField>
  </template>
}
