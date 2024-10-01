import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import PixStars from '@1024pix/pix-ui/components/pix-stars';

import MarkdownToHtml from '../../../../markdown-to-html';

export default class EvaluationResultsHero extends Component {
  @service currentUser;

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
      </div>
    </div>
  </template>
}
