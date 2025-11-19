import pageTitle from 'ember-page-title/helpers/page-title';
import AllTags from 'pix-admin/components/organizations/all-tags';
<template>
  {{pageTitle "Orga " @model.organization.id " | Tags"}}
  <AllTags @model={{@model}} />
</template>
