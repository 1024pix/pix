import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import List from 'pix-orga/components/campaign/list';
import NoCampaignPanel from 'pix-orga/components/campaign/no-campaign-panel';
<template>
  {{pageTitle (t "pages.campaigns-list.tabs.all-campaigns")}}

  {{#if @model.campaigns.meta.hasCampaigns}}
    <List
      @caption={{t "pages.campaigns-list.table.description-all-campaigns"}}
      @organizationId={{@model.organizationId}}
      @canDelete={{@model.isAdmin}}
      @campaigns={{@model.campaigns}}
      @nameFilter={{@controller.name}}
      @showCampaignOwner={{true}}
      @hideCampaignOwnerFilter={{false}}
      @ownerNameFilter={{@controller.ownerName}}
      @statusFilter={{@controller.status}}
      @onFilter={{@controller.triggerFiltering}}
      @onClear={{@controller.clearFilters}}
      @onClickCampaign={{@controller.goToCampaignPage}}
      @onDeleteCampaigns={{@controller.onDeleteCampaigns}}
    />
  {{else}}
    <NoCampaignPanel />
  {{/if}}
</template>
