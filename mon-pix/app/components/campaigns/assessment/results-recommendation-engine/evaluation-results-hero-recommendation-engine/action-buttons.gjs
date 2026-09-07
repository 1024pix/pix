import CampaignParticipationResetButton from './action-buttons/campaign-participation-reset-button';
import RecommendationButton from './action-buttons/recommendation-button';

<template>
  <div class="evaluation-results-hero-recommendation-engine__actions">
    {{#if @hasTrainings}}
      <RecommendationButton
        @hasHighlightedTraining={{@hasHighlightedTraining}}
        @onSeeRecommendationsButtonClicked={{@onSeeRecommendationsButtonClicked}}
      />
    {{/if}}
    {{#if @canResetCampaignParticipationResult}}
      <CampaignParticipationResetButton @campaign={{@campaign}} />
    {{/if}}
  </div>
</template>
