import pageTitle from 'ember-page-title/helpers/page-title';
import Credits from 'pix-admin/components/organizations/credits';

<template>
  {{pageTitle "Orga " @model.id " | Crédits"}}
  <Credits @organization={{@model}} />
</template>
