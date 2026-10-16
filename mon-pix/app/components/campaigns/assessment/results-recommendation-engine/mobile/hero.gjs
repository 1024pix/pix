import { PixStars } from '@1024pix/nebulix-ember';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import AcquiredBadgesCompact from '../evaluation-results-hero-recommendation-engine/acquired-badges-compact';

export default class MobileHero extends Component {
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
    <section class="reco-mobile-hero">
      <p class="reco-mobile-hero__percent">
        <strong class="reco-mobile-hero__percent-value">{{this.masteryRatePercentage}}
          <span class="reco-mobile-hero__percent-unit">%</span></strong>
        <span class="reco-mobile-hero__percent-label">{{t "pages.skill-review.hero.mastery-rate"}}</span>
      </p>

      {{#if this.hasStagesStars}}
        <div class="reco-mobile-hero__stars">
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
          <span class="reco-mobile-hero__stars-text" aria-hidden="true">
            {{t
              "pages.skill-review.stage.recommendedEngine.starsAcquired"
              acquired=this.reachedStage.acquired
              total=this.reachedStage.total
            }}
          </span>
        </div>
      {{/if}}

      {{#if @campaignParticipationResult.acquiredBadges.length}}
        <AcquiredBadgesCompact @acquiredBadges={{@campaignParticipationResult.acquiredBadges}} />
      {{/if}}
    </section>
  </template>
}
