import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import ResultDistribution from 'pix-orga/components/campaign/charts/result-distribution';
import EmptyState from 'pix-orga/components/campaign/empty-state';
import AssessmentCards from 'pix-orga/components/campaign/results/assessment-cards';
import AssessmentList from 'pix-orga/components/campaign/results/assessment-list';
<template>
  {{pageTitle (t "pages.campaign-results.title")}}
  <h2 class="screen-reader-only">{{t "pages.campaign-results.title"}}</h2>

  {{#if @model.campaign.hasSharedParticipations}}
    <AssessmentCards
      @hasStages={{@model.campaign.hasStages}}
      @stages={{@model.campaign.stages}}
      @sharedParticipationsCount={{@model.campaign.sharedParticipationsCount}}
      @averageResult={{@model.campaign.averageResult}}
      @totalStage={{@model.campaign.totalStage}}
      @reachedStage={{@model.campaign.reachedStage}}
    />

    <ResultDistribution @campaign={{@model.campaign}} @onSelectStage={{@controller.filterByStage}} />

    <AssessmentList
      @caption={{t "pages.campaign-results.table.caption"}}
      @campaign={{@model.campaign}}
      @participations={{@model.participations}}
      @selectedDivisions={{@controller.divisions}}
      @selectedGroups={{@controller.groups}}
      @selectedBadges={{@controller.badges}}
      @selectedUnacquiredBadges={{@controller.unacquiredBadges}}
      @selectedStages={{@controller.stages}}
      @searchFilter={{@controller.search}}
      @onClickParticipant={{@controller.goToAssessmentPage}}
      @onFilter={{@controller.triggerFiltering}}
      @onResetFilter={{@controller.resetFiltering}}
    />
  {{else}}
    {{#if @controller.isGarAuthenticationMethod}}
      <EmptyState />
    {{else}}
      <EmptyState @campaignCode={{@model.campaign.code}} />
    {{/if}}
  {{/if}}
</template>
