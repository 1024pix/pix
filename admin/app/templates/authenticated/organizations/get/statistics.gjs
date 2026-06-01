import pageTitle from 'ember-page-title/helpers/page-title';
import Statistics from 'pix-admin/components/organizations/statistics';

<template>
  {{pageTitle "Orga " @model.organization.id " | Statistiques"}}
  <Statistics @statistics={{@model}} />
</template>
