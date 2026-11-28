import pageTitle from 'ember-page-title/helpers/page-title';
import Credits from 'pix-admin/components/organizations/credits';

<template>
  {{pageTitle "Orga " @model.organization.id " | Crédits"}}
  <Credits @organization={{@model.organization}} @creditsLot={{@model.creditsLot}} />
</template>
