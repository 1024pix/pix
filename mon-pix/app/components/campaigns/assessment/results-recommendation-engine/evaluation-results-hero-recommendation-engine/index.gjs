import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import PixStars from '@1024pix/pix-ui/components/pix-stars';
import { hash } from '@ember/helper';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import MarkdownToHtml from '../../../../markdown-to-html';
import AcquiredBadgesCompact from './acquired-badges-compact';

export default class EvaluationResultsHeroRecommendationEngine extends Component {
  @service currentUser;
  @service media;

  @tracked stagedMessageContentShowMoreEnabled = false;
  @tracked isResetModalVisible = false;

  get masteryRatePercentage() {
    return Math.round(this.args.campaignParticipationResult.masteryRate * 100);
  }

  get stagedMessagebuttonLabel() {
    return this.stagedMessageContentShowMoreEnabled
      ? 'pages.skill-review.hero.staged-message.show-less'
      : 'pages.skill-review.hero.staged-message.show-more';
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

  get titleStyles() {
    const baseStyle = 'evaluation-results-hero-recommendation-engine__title';
    const titleSize = this.media.isMobile ? 'extra-small-size' : 'small-size';
    return `${baseStyle} ${baseStyle}--${titleSize}`;
  }

  get stagedMessageContentShouldBeEllipsed() {
    const container = document.getElementById('evaluation-results-hero-recommendation-engine-staged-message');
    const content = document.getElementById('evaluation-results-hero-recommendation-engine-staged-message-content');
    const isContentOverflowingContainer = content.scrollHeight > container?.offsetHeight;

    return this.media.isMobile && isContentOverflowingContainer;
  }

  @action toggleStagedMessage() {
    this.stagedMessageContentShowMoreEnabled = !this.stagedMessageContentShowMoreEnabled;
  }

  @action
  toggleResetModalVisibility() {
    this.isResetModalVisible = !this.isResetModalVisible;
  }

  <template>
    <div class="evaluation-results-hero-recommendation-engine">
      <div class="evaluation-results-hero-recommendation-engine__content">
        <h2 class="{{this.titleStyles}}">{{t
            "pages.skill-review.hero.thanks"
            name=this.currentUser.user.firstName
          }}</h2>
        {{#if this.media.isMobile}}
          <hr class="evaluation-results-hero-recommendation-engine__separator" />
        {{/if}}
        <p class="evaluation-results-hero-recommendation-engine__percent">
          <strong class="evaluation-results-hero-recommendation-engine__percent-value">
            {{this.masteryRatePercentage}}<span class="evaluation-results-hero-recommendation-engine__percent-unit">
              %</span>
          </strong>
          <span class="evaluation-results-hero-recommendation-engine__percent-label">{{t
              "pages.skill-review.hero.mastery-rate"
            }}</span>
        </p>

        {{#if this.hasStagesStars}}
          <div class="evaluation-results-hero-recommendation-engine__stars">
            <PixStars
              @count={{this.reachedStage.acquired}}
              @total={{this.reachedStage.total}}
              @alt={{t
                "pages.skill-review.stage.starsAcquired"
                acquired=this.reachedStage.acquired
                total=this.reachedStage.total
              }}
              @color="yellow"
            />
            <div class="evaluation-results-hero-recommendation-engine__stars-text" aria-hidden="true">
              {{t
                "pages.skill-review.stage.recommendedEngine.starsAcquired"
                acquired=this.reachedStage.acquired
                total=this.reachedStage.total
              }}
            </div>
          </div>
        {{/if}}

        {{#if @campaignParticipationResult.acquiredBadges.length}}
          <AcquiredBadgesCompact @acquiredBadges={{@campaignParticipationResult.acquiredBadges}} />
        {{/if}}

        <div class="evaluation-results-hero-recommendation-engine__actions">
          <PixButtonLink @route="authentication.login" @size="small" @variant="secondary-white">
            {{t "pages.skill-review.actions.back-to-pix"}}
          </PixButtonLink>
          {{#if @campaignParticipationResult.canReset}}
            <PixButton
              @iconBefore="refresh"
              @variant="tertiary-white"
              @triggerAction={{this.toggleResetModalVisibility}}
            >
              {{t "pages.skill-review.hero.retry.actions.reset"}}
            </PixButton>
            <PixModal
              class="evaluation-results-hero-recommendation-engine-reset-modal"
              @title={{t "pages.skill-review.reset.button"}}
              @showModal={{this.isResetModalVisible}}
              @onCloseButtonClick={{this.toggleResetModalVisibility}}
            >
              <:content>
                <p class="evaluation-results-hero-recommendation-engine-reset-modal__text">
                  {{t
                    "pages.skill-review.reset.modal.text"
                    targetProfileName=@campaign.targetProfileName
                    htmlSafe=true
                  }}
                </p>
                <PixNotificationAlert @type="warning">{{t
                    "pages.skill-review.reset.modal.warning-text"
                  }}</PixNotificationAlert>
              </:content>
              <:footer>
                <ul class="reset-campaign-participation-modal__footer">
                  <li>
                    <PixButton @variant="secondary" @triggerAction={{this.toggleResetModalVisibility}}>
                      {{t "common.actions.cancel"}}
                    </PixButton>
                  </li>
                  <li>
                    <PixButtonLink
                      @route="campaigns.entry-point"
                      @model={{@campaign.code}}
                      @query={{hash reset=true}}
                      @variant="error"
                    >
                      {{t "common.actions.confirm"}}
                    </PixButtonLink>
                  </li>
                </ul>
              </:footer>
            </PixModal>

          {{/if}}
        </div>
      </div>
    </div>
    {{#if @campaignParticipationResult.hasReachedStage}}
      <section
        id="evaluation-results-hero-recommendation-engine-staged-message"
        class="evaluation-results-hero-recommendation-engine-staged-message"
      >
        <h2 class="evaluation-results-hero-recommendation-engine-staged-message__title"><MarkdownToHtml
            @isInline={{true}}
            @markdown={{@campaignParticipationResult.reachedStage.title}}
          /></h2>
        <span
          id="evaluation-results-hero-recommendation-engine-staged-message-content"
          class="evaluation-results-hero-recommendation-engine-staged-message__content
            {{unless
              this.stagedMessageContentShowMoreEnabled
              'evaluation-results-hero-recommendation-engine-staged-message__content--ellipsed'
            }}"
        >
          <MarkdownToHtml @isInline={{true}} @markdown={{@campaignParticipationResult.reachedStage.message}} />
        </span>
        {{#if this.stagedMessageContentShouldBeEllipsed}}
          <PixButton @triggerAction={{this.toggleStagedMessage}} @variant="tertiary">
            {{t this.stagedMessagebuttonLabel}}
          </PixButton>
        {{/if}}
      </section>
    {{/if}}
  </template>
}
