import pageTitle from 'ember-page-title/helpers/page-title';
import Header from 'pix-orga/components/participant/profile/header';
import Table from 'pix-orga/components/participant/profile/table';
<template>
  {{pageTitle @model.campaign.name}}
  {{pageTitle @controller.pageTitle}}

  <article class="profile">
    <Header
      @campaign={{@model.campaign}}
      @campaignProfile={{@model.campaignProfile}}
      @campaignParticipationId={{@model.campaignParticipationId}}
    />

    <Table @competences={{@model.campaignProfile.sortedCompetences}} @isShared={{@model.campaignProfile.isShared}} />
  </article>
</template>
