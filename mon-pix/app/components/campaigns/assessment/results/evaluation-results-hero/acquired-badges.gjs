import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class EvaluationResultsHeroAcquiredBadges extends Component {
  get sortedAcquiredBadges() {
    return this.args.acquiredBadges.sort((a, b) => b.isCertifiable - a.isCertifiable);
  }

  <template>
    <h3 class="evaluation-results-hero-details__acquired-badges-title">
      {{t "pages.skill-review.hero.acquired-badges-title"}}
    </h3>
    <ul class="evaluation-results-hero-details__acquired-badges">
      {{#each this.sortedAcquiredBadges as |acquiredBadge|}}
        <li>
          <figure>
            <div class="image-container">
              <img src={{acquiredBadge.imageUrl}} alt={{acquiredBadge.altMessage}} />
              {{#if acquiredBadge.isCertifiable}}
                <span class="certifiable-label">{{t "pages.skill-review.badge-card.certifiable"}}</span>
              {{/if}}
            </div>
            <figcaption class="badge-name">{{acquiredBadge.title}}</figcaption>
          </figure>
        </li>
      {{/each}}
    </ul>
  </template>
}
