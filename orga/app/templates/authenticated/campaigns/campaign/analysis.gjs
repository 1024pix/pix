import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import Competences from 'pix-orga/components/campaign/analysis/competences';
import Recommendations from 'pix-orga/components/campaign/analysis/recommendations';
import EmptyState from 'pix-orga/components/campaign/empty-state';
<template>
  {{pageTitle (t "pages.campaign-review.title")}}

  {{#if @model.hasSharedParticipations}}
    <h2 class="screen-reader-only">{{t "pages.campaign-review.title"}}</h2>
    <Recommendations
      @campaignTubeRecommendations={{@model.campaignAnalysis.campaignTubeRecommendations}}
      @displayAnalysis={{@model.hasSharedParticipations}}
    />

    <Competences @campaignId={{@model.id}} @campaignCollectiveResult={{@model.campaignCollectiveResult}} />
  {{else}}
    {{#if @controller.isGarAuthenticationMethod}}
      <EmptyState />
    {{else}}
      <EmptyState @campaignCode={{@model.code}} />
    {{/if}}
  {{/if}}
</template>
