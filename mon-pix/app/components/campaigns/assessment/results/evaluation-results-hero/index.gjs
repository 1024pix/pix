import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import PixStars from '@1024pix/pix-ui/components/pix-stars';
import { fn } from '@ember/helper';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { not } from 'ember-truth-helpers';
import or from 'ember-truth-helpers/helpers/or';

import MarkdownToHtml from '../../../../markdown-to-html';
import AcquiredBadges from './acquired-badges';
import AttestationResult from './attestation-result';
import CustomOrganizationBlock from './custom-organization-block';
import RetryOrResetBlock from './retry-or-reset-block';

export default class EvaluationResultsHero extends Component {
  @service currentUser;
  @service metrics;
  @service router;
  @service store;
  @service tabManager;
  @service featureToggles;

  @tracked hasGlobalError = false;
  @tracked isButtonLoading = false;

  get masteryRatePercentage() {
    return Math.round(this.args.campaignParticipationResult.masteryRate * 100);
  }

  get hasStagesStars() {
    return (
      this.args.campaignParticipationResult.hasReachedStage &&
      this.args.campaignParticipationResult.reachedStage.totalStage > 1
    );
  }

  get reachedStage() {
    return {
      acquired: this.args.campaignParticipationResult.reachedStage.reachedStage - 1,
      total: this.args.campaignParticipationResult.reachedStage.totalStage - 1,
    };
  }

  get showCustomOrganizationBlock() {
    const hasCustomContent = this.args.campaign.customResultPageText || this.args.campaign.hasCustomResultPageButton;
    return (
      hasCustomContent && (this.args.campaign.isSimplifiedAccess || this.args.campaignParticipationResult.isShared)
    );
  }

  get displayQuestResult() {
    return (
      this.featureToggles.featureToggles?.isQuestEnabled && !this.currentUser.user.isAnonymous && this.hasQuestResults
    );
  }

  get isUserAnonymousAndUpgradeToRealUserEnabled() {
    return this.featureToggles.featureToggles?.upgradeToRealUserEnabled && this.currentUser.user.isAnonymous;
  }

  get dynamicRoute() {
    return this.featureToggles.featureToggles?.upgradeToRealUserEnabled && this.currentUser.user.isAnonymous
      ? 'inscription'
      : 'authentication.login';
  }

  get hasQuestResults() {
    return this.args.questResults && this.args.questResults.length > 0;
  }

  @action
  handleSeeTrainingsClick() {
    this.args.showTrainings();
  }

  @action
  async handleImproveResults() {
    if (this.isButtonLoading) return;

    try {
      this.hasGlobalError = false;
      this.isButtonLoading = true;

      const campaignParticipationResult = this.args.campaignParticipationResult;

      const adapter = this.store.adapterFor('campaign-participation-result');
      await adapter.beginImprovement(campaignParticipationResult.id);

      this.metrics.trackEvent({
        event: 'custom-event',
        'pix-event-category': 'Fin de parcours',
        'pix-event-action': 'Amélioration des résultats',
        'pix-event-name': "Clic sur le bouton 'Je retente'",
      });

      this.router.transitionTo('campaigns.entry-point', this.args.campaign.code);
    } catch {
      this.hasGlobalError = true;
    } finally {
      this.isButtonLoading = false;
    }
  }

  @action
  async handleShareResultsClick() {
    if (this.isButtonLoading) return;

    try {
      this.hasGlobalError = false;
      this.isButtonLoading = true;

      const campaignParticipationResult = this.args.campaignParticipationResult;

      await this.store.adapterFor('campaign-participation-result').share(campaignParticipationResult.id);

      this.args.onResultsShared();

      campaignParticipationResult.isShared = true;
      campaignParticipationResult.canImprove = false;

      this.metrics.trackEvent({
        event: 'custom-event',
        'pix-event-category': 'Fin de parcours',
        'pix-event-action': 'Envoi des résultats',
        'pix-event-name': "Envoi des résultats depuis l'en-tête",
      });
    } catch {
      this.hasGlobalError = true;
    } finally {
      this.isButtonLoading = false;
    }
  }

  @action
  setGlobalError(value) {
    this.hasGlobalError = value;
  }

  @action
  handleBackToHomepageDisplay() {
    this.metrics.trackEvent({
      event: 'custom-event',
      'pix-event-category': 'Fin de parcours',
      'pix-event-action': 'Sortie de parcours',
      'pix-event-name': "Affichage du bouton 'Revenir à la page d'accueil'",
    });
  }

  @action
  handleBackToHomepageClick() {
    this.metrics.trackEvent({
      event: 'custom-event',
      'pix-event-category': 'Fin de parcours',
      'pix-event-action': 'Sortie de parcours',
      'pix-event-name': "Clic sur le bouton 'Revenir à la page d'accueil'",
    });
  }

  <template>
    <div class="evaluation-results-hero">
      <div class="evaluation-results-hero__results">
        <p class="evaluation-results-hero-results__percent">
          <strong>{{this.masteryRatePercentage}}<span>%</span></strong>
          <span>{{t "pages.skill-review.hero.mastery-rate"}}</span>
        </p>
        {{#if this.hasStagesStars}}
          <PixStars
            class="evaluation-results-hero-results__stars"
            @count={{this.reachedStage.acquired}}
            @total={{this.reachedStage.total}}
            @alt={{t
              "pages.skill-review.stage.starsAcquired"
              acquired=this.reachedStage.acquired
              total=this.reachedStage.total
            }}
            @color="yellow"
          />

          <div class="evaluation-results-hero-results__stars-text" role="presentation">
            {{t
              "pages.skill-review.stage.starsAcquired"
              acquired=this.reachedStage.acquired
              total=this.reachedStage.total
            }}
          </div>
        {{/if}}

        {{#if this.displayQuestResult}}
          <AttestationResult @results={{@questResults}} @onError={{fn this.setGlobalError true}} />
        {{/if}}

      </div>
      <div class="evaluation-results-hero__details">
        <h2 class="evaluation-results-hero-details__title">
          {{t "pages.skill-review.hero.bravo" name=this.currentUser.user.firstName}}
        </h2>

        {{#if @campaignParticipationResult.hasReachedStage}}
          <div class="evaluation-results-hero-details__stage-message" data-testid="stage-message">
            <MarkdownToHtml @isInline={{true}} @markdown={{@campaignParticipationResult.reachedStage.message}} />
          </div>
        {{/if}}

        {{#if @isSharableCampaign}}
          {{#if @campaignParticipationResult.isShared}}
            <PixNotificationAlert
              class="evaluation-results-hero-results__shared-message"
              @type="success"
              @withIcon={{true}}
            >
              {{t "pages.skill-review.hero.shared-message"}}
            </PixNotificationAlert>
            {{#if @hasTrainings}}
              <p class="evaluation-results-hero-details__explanations">
                {{t "pages.skill-review.hero.explanations.trainings"}}
              </p>
            {{/if}}
          {{else if (not @campaignParticipationResult.isDisabled)}}
            <p class="evaluation-results-hero-details__explanations">
              {{t "pages.skill-review.hero.explanations.send-results"}}
            </p>
          {{/if}}
          {{#if @campaignParticipationResult.canImprove}}
            <p class="evaluation-results-hero-details__explanations">
              {{t "pages.skill-review.hero.explanations.improve"}}
            </p>
          {{/if}}
        {{/if}}

        <div class="evaluation-results-hero-details__actions">
          {{#if @isSharableCampaign}}
            {{#if @campaignParticipationResult.isShared}}
              {{#if this.isUserAnonymousAndUpgradeToRealUserEnabled}}
                <p>{{t "pages.sign-up.save-progress-message"}}</p>
                <PixButtonLink @route="inscription" @size="large">
                  {{t "pages.sign-up.actions.sign-up-on-pix"}}
                </PixButtonLink>
              {{/if}}
              {{#if @hasTrainings}}
                <PixButton @triggerAction={{this.handleSeeTrainingsClick}} @size="large">
                  {{t "pages.skill-review.hero.see-trainings"}}
                </PixButton>
              {{else}}
                {{#unless (or @campaign.hasCustomResultPageButton this.isUserAnonymousAndUpgradeToRealUserEnabled)}}
                  {{this.handleBackToHomepageDisplay}}
                  <PixButtonLink @route="authentication.login" @size="large" onclick={{this.handleBackToHomepageClick}}>
                    {{t "navigation.back-to-homepage"}}
                  </PixButtonLink>
                {{/unless}}
              {{/if}}
            {{else}}
              {{#if @campaignParticipationResult.isDisabled}}
                <PixNotificationAlert @type="warning" @withIcon={{true}}>
                  {{t "pages.skill-review.disabled-share"}}
                </PixNotificationAlert>
              {{else}}
                <PixButton
                  @triggerAction={{this.handleShareResultsClick}}
                  @size="large"
                  @isLoading={{this.isButtonLoading}}
                >
                  {{t "pages.skill-review.actions.send"}}
                </PixButton>
              {{/if}}
            {{/if}}
            {{#if @campaignParticipationResult.canImprove}}
              <PixButton
                @variant="tertiary"
                @size="large"
                @triggerAction={{this.handleImproveResults}}
                @isLoading={{this.isButtonLoading}}
              >
                {{t "pages.skill-review.actions.improve"}}
              </PixButton>
            {{/if}}
          {{else}}
            {{#unless @campaign.hasCustomResultPageButton}}
              {{this.handleBackToHomepageDisplay}}
              {{#if this.isUserAnonymousAndUpgradeToRealUserEnabled}}
                <p>{{t "pages.sign-up.save-progress-message"}}</p>
                <PixButtonLink @route={{this.dynamicRoute}} @size="large" onclick={{this.handleBackToHomepageClick}}>
                  {{t "pages.sign-up.actions.sign-up-on-pix"}}
                </PixButtonLink>
              {{else}}
                <PixButtonLink @route="authentication.login" @size="large" onclick={{this.handleBackToHomepageClick}}>
                  {{t "navigation.back-to-homepage"}}
                </PixButtonLink>
              {{/if}}
            {{/unless}}
          {{/if}}

          {{#if this.hasGlobalError}}
            <div class="evaluation-results-hero-results__actions-error">
              <PixNotificationAlert @type="error" @withIcon={{true}}>
                {{t "pages.skill-review.error"}}
              </PixNotificationAlert>
            </div>
          {{/if}}
        </div>

        {{#if @campaignParticipationResult.acquiredBadges.length}}
          <AcquiredBadges @acquiredBadges={{@campaignParticipationResult.acquiredBadges}} />
        {{/if}}
      </div>

      {{#if this.showCustomOrganizationBlock}}
        <CustomOrganizationBlock
          @campaign={{@campaign}}
          @campaignParticipationResult={{@campaignParticipationResult}}
        />
      {{/if}}

      {{#if @campaignParticipationResult.canRetry}}
        <RetryOrResetBlock @campaign={{@campaign}} @campaignParticipationResult={{@campaignParticipationResult}} />
      {{/if}}
    </div>
  </template>
}
