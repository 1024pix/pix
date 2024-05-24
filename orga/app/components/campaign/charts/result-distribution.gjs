import ParticipantsByMasteryPercentage from './participants-by-mastery-percentage';
import ParticipantsByStage from './participants-by-stage';

<template>
  {{#if @campaign.hasStages}}
    <ParticipantsByStage
      @campaignId={{@campaign.id}}
      @onSelectStage={{@onSelectStage}}
      class="assessment-results__charts hide-on-mobile"
    />
  {{else}}
    <ParticipantsByMasteryPercentage @campaignId={{@campaign.id}} class="assessment-results__charts hide-on-mobile" />
  {{/if}}
</template>
