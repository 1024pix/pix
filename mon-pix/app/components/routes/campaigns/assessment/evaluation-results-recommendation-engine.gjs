import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import ResultsDetails from '../../../campaigns/assessment/results/evaluation-results-tabs/results-details';
import Rewards from '../../../campaigns/assessment/results/evaluation-results-tabs/rewards';
import QuitResults from '../../../campaigns/assessment/results/quit-results';
import EvaluationResultsHeroRecommendationEngine from '../../../campaigns/assessment/results-recommendation-engine/evaluation-results-hero-recommendation-engine';
import Trainings from '../../../campaigns/assessment/results-recommendation-engine/trainings';

export default class EvaluationResultsRecommendationEngine extends Component {
  @service media;
  @service pixMetrics;

  constructor(...args) {
    super(...args);

    this.trackTrainingsDisplayed(this.trainings);
  }

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
      return this.args.model.trainings;
    }
  }

  get showBadges() {
    const badges = this.args.model.campaignParticipationResult.campaignParticipationBadges;

    return badges.some((badge) => badge.isAcquired || badge.isAlwaysVisible);
  }

  <template>
    <main role="main" class="evaluation-results-recommendation-engine">
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
        @questResults={{@model.questResults}}
      />

      {{#if this.hasTrainings}}
        <Trainings
          @trainings={{this.trainings}}
          @onCardClick={{this.onCardClick}}
          @onModalButtonClick={{this.onModalButtonClick}}
          @onModalAccordionClick={{this.onModalAccordionClick}}
        />
      {{/if}}

      <ResultsDetails
        @competenceResults={{@model.campaignParticipationResult.competenceResults}}
        @totalStage={{@model.campaignParticipationResult.reachedStage.totalStage}}
      />

      {{#if this.showBadges}}
        <Rewards @badges={{@model.campaignParticipationResult.campaignParticipationBadges}} />
      {{/if}}
    </main>
  </template>
}
