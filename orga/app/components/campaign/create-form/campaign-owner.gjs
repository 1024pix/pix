import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import ExplanationCard from '../../ui/explanation-card';
import FormField from '../../ui/form-field';

export default class CampaignOwner extends Component {
  @service locale;

  get campaignOwnerOptions() {
    if (!this.args.membersSortedByFullName) return [];

    return this.args.membersSortedByFullName.map((member) => ({ value: member.id, label: member.fullName }));
  }

  @action
  onChangeCampaignOwner(newOwnerId) {
    const selectedMember = this.args.membersSortedByFullName.find((member) => newOwnerId === member.id);
    if (selectedMember) {
      this.args.campaign.ownerId = selectedMember.id;
    }
  }

  <template>
    <FormField>
      <:default>
        <PixSelect
          class="pix-select-owner"
          @options={{this.campaignOwnerOptions}}
          @onChange={{this.onChangeCampaignOwner}}
          @value="{{@campaign.ownerId}}"
          @isSearchable={{true}}
          @placeholder={{t "pages.campaign-creation.owner.placeholder"}}
          @locale={{this.locale.currentLocale}}
          @searchPlaceholder={{t "pages.campaign-creation.owner.search-placeholder"}}
          @requiredLabel={{t "common.form.mandatory-fields-title"}}
          @hideDefaultOption={{true}}
        >
          <:label>{{t "pages.campaign-creation.owner.label"}}</:label>
        </PixSelect>

      </:default>

      <:information>
        <ExplanationCard>
          <:title>{{t "pages.campaign-creation.owner.title"}}</:title>

          <:message>{{t "pages.campaign-creation.owner.info"}}</:message>
        </ExplanationCard>

      </:information>
    </FormField>
  </template>
}
