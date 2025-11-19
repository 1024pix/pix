import pageTitle from 'ember-page-title/helpers/page-title';
import CampaignsSection from 'pix-admin/components/organizations/campaigns-section';
<template>
  {{pageTitle "Orga " @model.organizationId " | Campagnes"}}
  <CampaignsSection @campaigns={{@model.campaigns}} />
</template>
