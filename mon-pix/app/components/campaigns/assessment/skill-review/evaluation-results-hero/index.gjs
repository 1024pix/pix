import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixMessage from '@1024pix/pix-ui/components/pix-message';
import PixStars from '@1024pix/pix-ui/components/pix-stars';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { or } from 'ember-truth-helpers';
import ENV from 'mon-pix/config/environment';

import MarkdownToHtml from '../../../../markdown-to-html';
import AcquiredBadges from './acquired-badges';
import CustomOrganizationBlock from './custom-organization-block';
import RetryOrResetBlock from './retry-or-reset-block';

export default class EvaluationResultsHero extends Component {
  @service currentUser;
  @service router;
  @service store;

  @tracked hasGlobalError = false;
  @tracked isImproveButtonLoading = false;
  @tracked isShareResultsLoading = false;

  get isAutonomousCourse() {
    return this.args.campaign.organizationId === ENV.APP.AUTONOMOUS_COURSES_ORGANIZATION_ID;
  }

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

  @action
  handleSeeTrainingsClick() {
    this.args.showTrainings();
  }

  @action
  async improveResults() {
    if (this.isImproveButtonLoading) return;

    try {
      this.hasGlobalError = false;
      this.isImproveButtonLoading = true;

      const campaignParticipationResult = this.args.campaignParticipationResult;
      const adapter = this.store.adapterFor('campaign-participation-result');
      await adapter.beginImprovement(campaignParticipationResult.id);
      this.router.transitionTo('campaigns.entry-point', this.args.campaign.code);
    } catch {
      this.hasGlobalError = true;
    } finally {
      this.isImproveButtonLoading = false;
    }
  }

  @action
  async handleShareResultsClick() {
    if (this.isShareResultsLoading) return;

    try {
      this.hasGlobalError = false;
      this.isShareResultsLoading = true;

      const campaignParticipationResult = this.args.campaignParticipationResult;
      const adapter = this.store.adapterFor('campaign-participation-result');
      await adapter.share(campaignParticipationResult.id);

      campaignParticipationResult.isShared = true;
      campaignParticipationResult.canImprove = false;
    } catch {
      this.hasGlobalError = true;
    } finally {
      this.isShareResultsLoading = false;
    }
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
        {{#if @campaignParticipationResult.isShared}}
          <PixMessage class="evaluation-results-hero-results__shared-message" @type="success" @withIcon={{true}}>
            {{t "pages.skill-review.hero.shared-message"}}
          </PixMessage>
          {{#if @hasTrainings}}
            <p class="evaluation-results-hero-details__explanations">
              {{t "pages.skill-review.hero.explanations.trainings"}}
            </p>
          {{/if}}
        {{else}}
          {{#unless this.isAutonomousCourse}}
            <p class="evaluation-results-hero-details__explanations">
              {{t "pages.skill-review.hero.explanations.send-results"}}
            </p>
          {{/unless}}
        {{/if}}
        {{#if @campaignParticipationResult.canImprove}}
          <p class="evaluation-results-hero-details__explanations">
            {{t "pages.skill-review.hero.explanations.improve"}}
          </p>
        {{/if}}
        <div class="evaluation-results-hero-details__actions">
          {{#if @campaignParticipationResult.isShared}}
            {{#if @hasTrainings}}
              <PixButton @triggerAction={{this.handleSeeTrainingsClick}} @size="large">
                {{t "pages.skill-review.hero.see-trainings"}}
              </PixButton>
            {{else}}
              <PixButtonLink @route="authentication.login" @size="large">
                {{t "navigation.back-to-homepage"}}
              </PixButtonLink>
            {{/if}}
          {{else}}
            {{#if this.isAutonomousCourse}}
              <PixButtonLink @route="authentication.login" @size="large">
                {{t "navigation.back-to-homepage"}}
              </PixButtonLink>
            {{else}}
              <PixButton
                @triggerAction={{this.handleShareResultsClick}}
                @size="large"
                @isLoading={{this.isShareResultsLoading}}
              >
                {{t "pages.skill-review.actions.send"}}
              </PixButton>
            {{/if}}
          {{/if}}

          {{#if @campaignParticipationResult.canImprove}}
            <PixButton
              @variant="tertiary"
              @size="large"
              @triggerAction={{this.improveResults}}
              @isLoading={{this.isImproveButtonLoading}}
            >
              {{t "pages.skill-review.actions.improve"}}
            </PixButton>
          {{/if}}

          {{#if this.hasGlobalError}}
            <div class="evaluation-results-hero-results__actions-error">
              <PixMessage @type="error" @withIcon={{true}}>
                {{t "pages.skill-review.error"}}
              </PixMessage>
            </div>
          {{/if}}
        </div>
        {{#if @campaignParticipationResult.acquiredBadges.length}}
          <AcquiredBadges @acquiredBadges={{@campaignParticipationResult.acquiredBadges}} />
        {{/if}}
      </div>
      {{#if (or @campaign.customResultPageText @campaign.hasCustomResultPageButton)}}
        <CustomOrganizationBlock
          @customResultPageText={{@campaign.customResultPageText}}
          @customResultPageButtonText={{@campaign.customResultPageButtonText}}
          @customResultPageButtonUrl={{@campaign.customResultPageButtonUrl}}
        />
      {{/if}}
      {{#if @campaignParticipationResult.canRetry}}
        <RetryOrResetBlock @campaign={{@campaign}} @campaignParticipationResult={{@campaignParticipationResult}} />
      {{/if}}
    </div>
  </template>
}
