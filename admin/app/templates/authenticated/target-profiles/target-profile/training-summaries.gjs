import pageTitle from 'ember-page-title/helpers/page-title';
import TrainingSummaries from 'pix-admin/components/target-profiles/training-summaries';
<template>
  {{pageTitle "Profil " @model.targetProfile.id " Contenus formatifs | Pix Admin" replace=true}}
  <TrainingSummaries @trainingSummaries={{@model.trainingSummaries}} />
</template>
