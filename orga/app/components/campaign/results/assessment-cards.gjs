import CampaignResultAverage from '../cards/result-average';
import CampaignSharedCount from '../cards/shared-count';
import CampaignStageAverage from '../cards/stage-average';

<template>
  <div class="assessment-cards">
    {{#if @hasStages}}
      <CampaignStageAverage
        @totalStage={{@totalStage}}
        @reachedStage={{@reachedStage}}
        @stages={{@stages}}
        class="assessment-cards__average-card"
      />
    {{else}}
      <CampaignResultAverage @value={{@averageResult}} class="assessment-cards__average-card" />
    {{/if}}

    <CampaignSharedCount @value={{@sharedParticipationsCount}} @isTypeAssessment={{true}} />
  </div>
</template>
