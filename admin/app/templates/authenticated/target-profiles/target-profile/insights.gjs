import pageTitle from 'ember-page-title/helpers/page-title';
import Insights from 'pix-admin/components/target-profiles/insights';
<template>
  {{pageTitle "Profil " @model.id " Clés de lecture | Pix Admin" replace=true}}
  <Insights @targetProfile={{@controller.model.targetProfile}} @stageCollection={{@controller.model.stageCollection}} />
</template>
