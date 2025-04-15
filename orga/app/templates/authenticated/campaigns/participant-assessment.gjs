import pageTitle from 'ember-page-title/helpers/page-title';
import Header from 'pix-orga/components/participant/assessment/header';
import Tabs from 'pix-orga/components/participant/assessment/tabs';
<template>
  {{pageTitle @model.campaign.name}}

  <article class="participant">
    <Header
      @campaign={{@model.campaign}}
      @participation={{@model.campaignAssessmentParticipation}}
      @allParticipations={{@model.availableCampaignParticipations}}
    />

    <Tabs @campaignId={{@model.campaign.id}} @participationId={{@model.campaignAssessmentParticipation.id}} />

    {{outlet}}
  </article>
</template>
