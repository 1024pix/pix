import pageTitle from 'ember-page-title/helpers/page-title';
import TargetProfilesSection from 'pix-admin/components/organizations/target-profiles-section';
<template>
  {{pageTitle "Orga " @model.id " | Profils cibles"}}
  <TargetProfilesSection
    @organization={{@model.organization}}
    @targetProfileSummaries={{@model.targetProfileSummaries}}
  />
</template>
