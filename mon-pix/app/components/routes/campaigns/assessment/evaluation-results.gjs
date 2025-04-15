import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import ENV from 'mon-pix/config/environment';

import EvaluationResultsHero from '../../../campaigns/assessment/results/evaluation-results-hero';
import EvaluationResultsTabs from '../../../campaigns/assessment/results/evaluation-results-tabs';
import EvaluationSharedResultsModal from '../../../campaigns/assessment/results/evaluation-shared-results-modal';
import QuitResults from '../../../campaigns/assessment/results/quit-results';

export default class EvaluationResults extends Component {
  @service tabManager;
  @service featureToggles;

  @tracked showEvaluationResultsModal = false;

  get isResultsSharedModalEnabled() {
    return this.featureToggles.featureToggles?.isResultsSharedModalEnabled && this.hasTrainings;
  }

  get hasTrainings() {
    return Boolean(this.args.model.trainings.length);
  }

  get isSharableCampaign() {
    const isAutonomousCourse = this.args.model.campaign.organizationId === ENV.APP.AUTONOMOUS_COURSES_ORGANIZATION_ID;
    return !isAutonomousCourse && !this.args.model.campaign.isForAbsoluteNovice;
  }

  get trainingsForModal() {
    const MAX_TRAININGS_MODAL_DISPLAYED = 3;
    return this.args.model.trainings.slice(0, MAX_TRAININGS_MODAL_DISPLAYED);
  }

  @action
  showTrainings() {
    const tabElement = document.querySelector('[role="tablist"]');
    const tabElementTopPosition = tabElement.getBoundingClientRect().top;

    window.scrollTo({
      top: tabElementTopPosition,
      behavior: 'smooth',
    });

    this.tabManager.setActiveTab(2);
  }

  @action
  shareResults() {
    this.showEvaluationResultsModal = true;
  }

  @action
  closeModal() {
    this.showEvaluationResultsModal = false;
  }

  <template>
    <main role="main" class="evaluation-results">
      <header class="evaluation-results__header">
        <img class="evaluation-results-header__logo" src="/images/pix-logo-dark.svg" alt="{{t 'common.pix'}}" />
        <h1 class="evaluation-results-header__title">
          <span>{{@model.campaign.title}}</span>
          <span class="sr-only">{{t "pages.skill-review.abstract-title"}}</span>
        </h1>
        <QuitResults
          @isCampaignShared={{@model.campaignParticipationResult.isShared}}
          @isSharableCampaign={{this.isSharableCampaign}}
        />
      </header>
      <EvaluationResultsHero
        @campaign={{@model.campaign}}
        @campaignParticipationResult={{@model.campaignParticipationResult}}
        @questResults={{@model.questResults}}
        @hasTrainings={{this.hasTrainings}}
        @showTrainings={{this.showTrainings}}
        @isSharableCampaign={{this.isSharableCampaign}}
        @onResultsShared={{this.shareResults}}
      />
      <EvaluationResultsTabs
        @campaign={{@model.campaign}}
        @campaignParticipationResult={{@model.campaignParticipationResult}}
        @questResults={{@model.questResults}}
        @isSharableCampaign={{this.isSharableCampaign}}
        @trainings={{@model.trainings}}
        @onResultsShared={{this.shareResults}}
      />
      {{#if this.isResultsSharedModalEnabled}}
        <EvaluationSharedResultsModal
          @trainings={{this.trainingsForModal}}
          @showModal={{this.showEvaluationResultsModal}}
          @onCloseButtonClick={{this.closeModal}}
        />
      {{/if}}
    </main>
  </template>
}
