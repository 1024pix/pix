import { action } from '@ember/object';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import EvaluationResultsHero from '../../../campaigns/assessment/skill-review/evaluation-results-hero';
import EvaluationResultsTabs from '../../../campaigns/assessment/skill-review/evaluation-results-tabs';
import QuitResults from '../../../campaigns/assessment/skill-review/quit-results';

export default class EvaluationResults extends Component {
  get hasTrainings() {
    return Boolean(this.args.model.trainings.length);
  }

  @action
  showTrainings() {
    const tabElement = document.querySelector('[role="tablist"]');
    const tabElementTopPosition = tabElement.getBoundingClientRect().top;

    window.scrollTo({
      top: tabElementTopPosition,
      behavior: 'smooth',
    });

    // TODO: display trainings tab
  }

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
        @hasTrainings={{this.hasTrainings}}
        @showTrainings={{this.showTrainings}}
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
}
