import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import ENV from 'mon-pix/config/environment';

import ResultsDetails from '../../../campaigns/assessment/results/evaluation-results-tabs/results-details';
import Rewards from '../../../campaigns/assessment/results/evaluation-results-tabs/rewards';
import QuitResults from '../../../campaigns/assessment/results/quit-results';
import Drawer from '../../../campaigns/assessment/results-recommendation-engine/drawer';
import EvaluationResultsHeroRecommendationEngine from '../../../campaigns/assessment/results-recommendation-engine/evaluation-results-hero-recommendation-engine';
import Trainings, { TRAININGS_LIST_ID } from '../../../campaigns/assessment/results-recommendation-engine/trainings';

export default class EvaluationResultsRecommendationEngine extends Component {
  @service media;
  @service pixMetrics;

  constructor(...args) {
    super(...args);

    this.trackTrainingsDisplayed(this.trainings);
  }

  @tracked _drawerRevealedByScroll = false;
  @tracked _expandedDrawer = false;

  @action onCardClick({ trainingId }) {
    this.pixMetrics.trackEvent('Moteur de reco - Clic sur la carte du contenu formatif', {
      trainingId,
    });
  }

  @action onModalButtonClick({ trainingId }) {
    this.pixMetrics.trackEvent('Moteur de reco - Clic sur le bouton "Découvrir le programme/module"', {
      trainingId,
    });
  }

  @action onModalAccordionClick({ trainingId, accordionName }) {
    this.pixMetrics.trackEvent("Moteur de reco - Clic sur l'accordéon de la modale du contenu formatif", {
      trainingId,
      accordionName,
    });
  }

  @action onNavigationButtonClick(_) {
    this.pixMetrics.trackEvent('Moteur de reco - scroll dans les contenus formatifs', {});
  }

  trackTrainingsDisplayed(trainings) {
    trainings.forEach((training, index) => {
      this.pixMetrics.trackEvent('Moteur de reco - Affichage du contenu formatif sur la page de résultats', {
        trainingId: training.id,
        position: index + 1,
      });
    });
  }

  get hasTrainings() {
    return Boolean(this.trainings.length);
  }

  get trainings() {
    if (this.args.model.campaign.isPartOfCombinedCourse) {
      return [];
    } else {
      return this.highlightedTraining
        ? this.args.model.trainings.filter((training) => training.id !== this.highlightedTraining.id)
        : this.args.model.trainings;
    }
  }

  get showBadges() {
    const badges = this.args.model.campaignParticipationResult.campaignParticipationBadges;

    return badges.some((badge) => badge.isAcquired || badge.isAlwaysVisible);
  }

  get shouldShowDrawer() {
    if (this.args.model.hasAnsweredSurvey) {
      return false;
    }
    return this._drawerRevealedByScroll;
  }

  get shouldExpandDrawer() {
    return this.shouldShowDrawer && this._expandedDrawer;
  }

  get scrollBehavior() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
  }

  get highlightedTraining() {
    return this.args.model.trainings.find((training) => training.isHighlighted);
  }

  @action revealDrawer() {
    setTimeout(() => {
      this._drawerRevealedByScroll = true;
      this._expandedDrawer = true;
      this.pixMetrics.trackEvent('Moteur de reco - affichage du feedback NPS');
    }, ENV.APP.DRAWER_REVEAL_DELAY_MS);
  }

  @action collapseDrawer() {
    this._expandedDrawer = false;
  }

  @action onSeeRecommendationsButtonClicked() {
    if (this.hasTrainings) {
      this.pixMetrics.trackEvent('Moteur de reco - Clic sur le bouton "Voir mes recommandations"', {});
      const trainingsList = document.getElementById(TRAININGS_LIST_ID);
      trainingsList.focus({ preventScroll: true, focusVisible: true });
      trainingsList.scrollIntoView({ behavior: this.scrollBehavior });
    }
  }

  <template>
    <main
      class="evaluation-results-recommendation-engine
        {{if this.shouldExpandDrawer 'evaluation-results-recommendation-engine--drawer-expanded'}}"
    >
      <header class="evaluation-results__header">
        <img class="evaluation-results-header__logo" src="/images/pix-logo-dark.svg" alt="{{t 'common.pix'}}" />
        <h1 class="evaluation-results-header__title">
          {{#unless this.media.isMobile}}
            <span>{{@model.campaign.title}}</span>
          {{/unless}}
          <span class="sr-only">{{t "pages.skill-review.abstract-title"}}</span>
        </h1>
        <QuitResults />
      </header>
      <EvaluationResultsHeroRecommendationEngine
        @campaign={{@model.campaign}}
        @campaignParticipationResult={{@model.campaignParticipationResult}}
        @highlightedTraining={{this.highlightedTraining}}
        @hasTrainings={{this.hasTrainings}}
        @onCardClick={{this.onCardClick}}
        @onSeeRecommendationsButtonClicked={{this.onSeeRecommendationsButtonClicked}}
        @questResults={{@model.questResults}}
      />

      {{#if this.hasTrainings}}
        <Trainings
          @trainings={{this.trainings}}
          @onCardClick={{this.onCardClick}}
          @onModalButtonClick={{this.onModalButtonClick}}
          @onModalAccordionClick={{this.onModalAccordionClick}}
          @onNavigationButtonClick={{this.onNavigationButtonClick}}
          @onFullyVisible={{this.revealDrawer}}
        />
      {{/if}}

      <ResultsDetails
        @competenceResults={{@model.campaignParticipationResult.competenceResults}}
        @totalStage={{@model.campaignParticipationResult.reachedStage.totalStage}}
      />

      {{#if this.showBadges}}
        <Rewards @badges={{@model.campaignParticipationResult.campaignParticipationBadges}} />
      {{/if}}

      {{#if this.shouldShowDrawer}}
        <Drawer @campaignId={{@model.campaign.id}} @onHide={{this.collapseDrawer}} />
      {{/if}}
    </main>
  </template>
}
