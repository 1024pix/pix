import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import EvaluationResultsHero from '../../../campaigns/assessment/results/evaluation-results-hero';
import EvaluationResultsTabs from '../../../campaigns/assessment/results/evaluation-results-tabs';
import EvaluationSharedResultsModal from '../../../campaigns/assessment/results/evaluation-shared-results-modal';
import QuitResults from '../../../campaigns/assessment/results/quit-results';

export default class EvaluationResults extends Component {
  @service tabManager;
  @service config;

  // eslint-disable-next-line ember/no-tracked-properties-from-args
  @tracked showEvaluationResultsModal = this.args.model.showTrainings;

  get isResultsSharedModalEnabled() {
    return this.hasTrainings;
  }

  get hasTrainings() {
    return Boolean(this.trainings.length);
  }

  get isSharableCampaign() {
    const isAutonomousCourse = this.args.model.campaign.organizationId === this.config.autonomousCoursesOrganizationId;
    return !isAutonomousCourse && !this.args.model.campaign.isForAbsoluteNovice;
  }

  get trainingsForModal() {
    const MAX_TRAININGS_MODAL_DISPLAYED = 3;
    return this.trainings.slice(0, MAX_TRAININGS_MODAL_DISPLAYED);
  }

  get trainings() {
    if (this.args.model.campaign.isPartOfCombinedCourse) {
      return [];
    } else {
      return this.args.model.trainings;
    }
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
    if (this.args.model.campaign.isPartOfCombinedCourse) {
      return;
    }
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
        @trainings={{this.trainings}}
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
