import { LinkTo } from '@ember/routing';
import { t } from 'ember-intl';

import EvaluationResultsTabs from '../../../campaigns/assessment/skill-review/evaluation-results-tabs';

<template>
  <div class="evaluation-results">
    <header class="evaluation-results__header">
      <img class="evaluation-results-header__logo" src="/images/pix-logo-dark.svg" alt="{{t 'common.pix'}}" />
      <h2 class="evaluation-results-header__title">
        <span>{{@model.campaign.title}}</span>
      </h2>
      <LinkTo @route="authenticated" class="evaluation-results-header__back-link">
        {{t "common.actions.quit"}}
      </LinkTo>
    </header>
    <EvaluationResultsTabs />
  </div>
</template>
