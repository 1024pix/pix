import { t } from 'ember-intl';

import EvaluationResultsHero from '../../../campaigns/assessment/skill-review/evaluation-results-hero';
import EvaluationResultsTabs from '../../../campaigns/assessment/skill-review/evaluation-results-tabs';
import QuitResults from '../../../campaigns/assessment/skill-review/quit-results';

<template>
  <div class="evaluation-results">
    <header class="evaluation-results__header">
      <img class="evaluation-results-header__logo" src="/images/pix-logo-dark.svg" alt="{{t 'common.pix'}}" />
      <h2 class="evaluation-results-header__title">
        <span>{{@model.campaign.title}}</span>
      </h2>
      <QuitResults @isCampaignShared={{@model.campaignParticipationResult.isShared}} />
    </header>
    <EvaluationResultsHero
      @campaign={{@model.campaign}}
      @campaignParticipationResult={{@model.campaignParticipationResult}}
    />
    <EvaluationResultsTabs
      @badges={{@model.campaignParticipationResult.campaignParticipationBadges}}
      @campaignParticipationResultId={{@model.campaignParticipationResult.id}}
      @competenceResults={{@model.campaignParticipationResult.competenceResults}}
      @isParticipationShared={{@model.campaignParticipationResult.isShared}}
      @totalStage={{@model.campaignParticipationResult.reachedStage.totalStage}}
      @trainings={{@model.trainings}}
    />
  </div>
</template>
