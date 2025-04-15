import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import Dashboard from 'pix-orga/components/campaign/activity/dashboard';
import ParticipantsList from 'pix-orga/components/campaign/activity/participants-list';
import EmptyState from 'pix-orga/components/campaign/empty-state';
<template>
  {{pageTitle (t "pages.campaign-activity.title")}}
  <h2 class="screen-reader-only">{{t "pages.campaign-activity.title"}}</h2>

  {{#if @model.campaign.hasParticipations}}
    <Dashboard
      @campaign={{@model.campaign}}
      @totalParticipations={{@model.participations.length}}
      @class="activity__dashboard"
    />

    <h3 class="screen-reader-only">{{t "pages.campaign-activity.table.title"}}</h3>

    <ParticipantsList
      @campaign={{@model.campaign}}
      @onClickParticipant={{@controller.goToParticipantPage}}
      @participations={{@model.participations}}
      @selectedStatus={{@controller.status}}
      @selectedDivisions={{@controller.divisions}}
      @selectedGroups={{@controller.groups}}
      @rowCount={{@model.participations.meta.rowCount}}
      @searchFilter={{@controller.search}}
      @onFilter={{@controller.triggerFiltering}}
      @onResetFilter={{@controller.resetFiltering}}
      @deleteCampaignParticipation={{@controller.deleteCampaignParticipation}}
      @showParticipationCount={{@model.campaign.multipleSendings}}
    />
  {{else}}
    {{#if @controller.isGarAuthenticationMethod}}
      <EmptyState />
    {{else}}
      <EmptyState @campaignCode={{@model.campaign.code}} />
    {{/if}}
  {{/if}}
</template>
