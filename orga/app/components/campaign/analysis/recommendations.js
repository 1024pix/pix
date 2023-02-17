import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';

export default class Recommendations extends Component {
  @service intl;
  @tracked sortedRecommendations;
  @tracked order;

  constructor() {
    super(...arguments);
    this.sortedRecommendations = this.args.campaignTubeRecommendations
      ? this.args.campaignTubeRecommendations.sortBy('averageScore')
      : [];
  }

  get description() {
    return htmlSafe(
      this.intl.t('pages.campaign-review.description', {
        bubble:
          '<span aria-hidden="true" focusable="false">(<svg height="10" width="10" role="img"><circle cx="5" cy="5" r="5" class="campaign-details-analysis recommendation-indicator__bubble" /></svg>)</span>',
      })
    );
  }

  @action
  sortRecommendationOrder(order) {
    this.order = order;
    if (!this.sortedRecommendations) {
      return null;
    } else if (order === 'desc') {
      this.sortedRecommendations = this.args.campaignTubeRecommendations.sortBy('averageScore');
    } else {
      this.sortedRecommendations = this.args.campaignTubeRecommendations.sortBy('averageScore').reverse();
    }
  }
}
