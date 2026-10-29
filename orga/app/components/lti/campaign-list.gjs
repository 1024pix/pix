import { PixButton, PixModal, PixTable, PixTableColumn, PixTag } from '@1024pix/nebulix-ember';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import PageTitle from 'pix-orga/components/ui/page-title';

export default class CampaignList extends Component {
  @tracked isModalOpen = false;
  @tracked selectedCampaign;

  @action
  openModal(campaign) {
    this.selectedCampaign = campaign;
    this.isModalOpen = true;
  }

  @action
  closeModal() {
    this.isModalOpen = false;
  }

  <template>
    <main class="lti-page">
      <PageTitle>
        <:title>{{t "pages.lti-campaigns.title"}}</:title>
      </PageTitle>
      <PixTable
        @variant="orga"
        @caption="{{t 'pages.lti-campaigns.title'}}"
        @data={{@campaigns}}
        @onRowClick={{this.openModal}}
      >
        <:columns as |campaign context|>
          <PixTableColumn @context={{context}}>
            <:header>{{t "pages.lti-campaigns.columns.campaign-name"}}</:header>
            <:cell>{{campaign.name}}</:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>{{t "pages.lti-campaigns.columns.campaign-type"}}</:header>
            <:cell>
              {{#if (eq campaign.type "ASSESSMENT")}}
                <PixTag @variant="success">{{t "pages.lti-campaigns.campaign-types.ASSESSMENT"}}</PixTag>
              {{/if}}
              {{#if (eq campaign.type "PROFILES_COLLECTION")}}
                <PixTag @variant="secondary">{{t "pages.lti-campaigns.campaign-types.PROFILES_COLLECTION"}}</PixTag>
              {{/if}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>{{t "pages.lti-campaigns.columns.organization"}}</:header>
            <:cell>{{campaign.organizationName}}</:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>{{t "pages.lti-campaigns.columns.code"}}</:header>
            <:cell>{{campaign.code}}</:cell>
          </PixTableColumn>
        </:columns>
      </PixTable>
      <PixModal
        @title={{t "pages.lti-campaigns.modal-title"}}
        @showModal={{this.isModalOpen}}
        @onCloseButtonClick={{this.closeModal}}
        @variant="orga"
      >
        <:content>
          {{#if (eq this.selectedCampaign.type "ASSESSMENT")}}
            <PixTag @variant="success">{{t "pages.lti-campaigns.campaign-types.ASSESSMENT"}}</PixTag>
          {{/if}}
          {{#if (eq this.selectedCampaign.type "PROFILES_COLLECTION")}}
            <PixTag @variant="secondary">{{t "pages.lti-campaigns.campaign-types.PROFILES_COLLECTION"}}</PixTag>
          {{/if}}

          <h2 class="pix-title-xxs lti-campaign-modal-title">{{this.selectedCampaign.name}}</h2>

          <p>
            {{#if (eq this.selectedCampaign.type "ASSESSMENT")}}
              {{this.selectedCampaign.description}}
            {{else if (eq this.selectedCampaign.type "PROFILES_COLLECTION")}}
              {{t "pages.campaign-creation.purpose.profiles-collection-info"}}
            {{/if}}
          </p>

        </:content>
        <:footer>
          <form method="POST" action="/api/lti/select-campaign">
            <input type="hidden" name="campaignId" value={{this.selectedCampaign.id}} />
            <PixButton type="submit" @variant="primary">{{t "pages.lti-campaigns.select-campaign"}}</PixButton>
          </form>
        </:footer>
      </PixModal>
    </main>
  </template>
}
