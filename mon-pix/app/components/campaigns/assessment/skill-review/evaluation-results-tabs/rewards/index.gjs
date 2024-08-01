import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import RewardsBadge from './badge';

export default class Rewards extends Component {
  getFilteredAndSortedBadges(acquisitionStatus) {
    return this.args.badges
      .toArray()
      .filter(({ isAcquired }) => isAcquired === acquisitionStatus)
      .sort((a, b) => b.isCertifiable - a.isCertifiable);
  }

  get acquiredBadges() {
    return this.getFilteredAndSortedBadges(true);
  }

  get notAcquiredBadges() {
    return this.getFilteredAndSortedBadges(false);
  }

  <template>
    <h2 class="evaluation-results-tab__title">
      {{t "pages.skill-review.tabs.rewards.title"}}
    </h2>
    <p class="evaluation-results-tab__description">
      {{t "pages.skill-review.tabs.rewards.description"}}
    </p>
    {{#if this.acquiredBadges.length}}
      <h2 class="evaluation-results-tab__badges-title evaluation-results-tab__badges-title--acquired">
        <FaIcon @icon="circle-check" />
        {{t "pages.skill-review.badge-card.acquired"}}
      </h2>
      <ul class="evaluation-results-tab__badges-list">
        {{#each this.acquiredBadges as |badge|}}
          <RewardsBadge @badge={{badge}} />
        {{/each}}
      </ul>
    {{/if}}
    {{#if this.notAcquiredBadges.length}}
      <h2 class="evaluation-results-tab__badges-title evaluation-results-tab__badges-title--not-acquired">
        <FaIcon @icon="circle-xmark" />
        {{t "pages.skill-review.badge-card.not-acquired"}}
      </h2>
      <ul class="evaluation-results-tab__badges-list">
        {{#each this.notAcquiredBadges as |badge|}}
          <RewardsBadge @badge={{badge}} />
        {{/each}}
      </ul>
    {{/if}}
  </template>
}
