import pageTitle from 'ember-page-title/helpers/page-title';
import ParticipationsSection from 'pix-admin/components/campaigns/participations-section';
<template>
  {{pageTitle "Campagne " @model.campaignId " | Participations"}}
  <ParticipationsSection
    @participations={{@model.participations}}
    @externalIdLabel={{@model.externalIdLabel}}
    @updateParticipantExternalId={{@controller.updateParticipantExternalId}}
  />
</template>
