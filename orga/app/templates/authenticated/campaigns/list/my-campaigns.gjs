import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import List from 'pix-orga/components/campaign/list';
import NoCampaignPanel from 'pix-orga/components/campaign/no-campaign-panel';
<template>
  {{pageTitle (t "pages.campaigns-list.tabs.my-campaigns")}}

  {{#if @model.campaigns.meta.hasCampaigns}}
    <List
      @caption={{t "pages.campaigns-list.table.description-my-campaigns"}}
      @organizationId={{@model.organizationId}}
      @campaigns={{@model.campaigns}}
      @nameFilter={{@controller.name}}
      @statusFilter={{@controller.status}}
      @ownerNameFilter={{@controller.ownerName}}
      @onFilter={{@controller.triggerFiltering}}
      @onClear={{@controller.clearFilters}}
      @onClickCampaign={{@controller.goToCampaignPage}}
      @canDelete={{true}}
      @showCampaignOwner={{false}}
      @hideCampaignOwnerFilter={{true}}
      @onDeleteCampaigns={{@controller.onDeleteCampaigns}}
    />
  {{else}}
    <NoCampaignPanel />
  {{/if}}
</template>
