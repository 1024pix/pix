import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class EvaluationResultsHero extends Component {
  @service currentUser;

  get masteryRatePercentage() {
    return Math.round(this.args.campaignParticipationResult.masteryRate * 100);
  }

  <template>
    <div class="evaluation-results-hero">
      <div class="evaluation-results-hero__results">
        <p class="evaluation-results-hero-results__percent">
          <strong>{{this.masteryRatePercentage}}<span>%</span></strong>
          <span>{{t "pages.skill-review.hero.mastery-rate"}}</span>
        </p>
      </div>
      <div class="evaluation-results-hero__details">
        <h2 class="evaluation-results-hero-details__title">
          {{t "pages.skill-review.hero.bravo" name=this.currentUser.user.firstName}}
        </h2>
      </div>
    </div>
  </template>
}
