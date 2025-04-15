import pageTitle from 'ember-page-title/helpers/page-title';
import gt from 'ember-truth-helpers/helpers/gt';
import Recommendations from 'pix-orga/components/campaign/analysis/recommendations';
<template>
  {{pageTitle @controller.pageTitle}}

  <Recommendations
    @campaignTubeRecommendations={{@model.campaignAnalysis.campaignTubeRecommendations}}
    @displayAnalysis={{gt @model.campaignAnalysis.campaignTubeRecommendations.length 0}}
    @participantFirstName={{@model.firstName}}
    @participantLastName={{@model.lastName}}
  />
</template>
