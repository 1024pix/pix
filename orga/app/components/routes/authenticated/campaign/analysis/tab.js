import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/string';

export default class Tab extends Component {
  @service intl;
  @tracked
  sortedRecommendations;

  constructor() {
    super(...arguments);
    this.sortedRecommendations = this.args.campaignTubeRecommendations
      ? this.args.campaignTubeRecommendations.sortBy('averageScore')
      : [];
  }

  get description() {
    return htmlSafe(this.intl.t('pages.campaign-review.description',
      { bubble: '<svg height="10" width="10"><circle cx="5" cy="5" r="5" class="campaign-details-analysis recommendation-indicator__bubble" /></svg>' },
    ));
  }

  @action
  sortRecommendationOrder(order) {
    if (!this.sortedRecommendations) {
      return null;
    } else if (order === 'desc') {
      this.sortedRecommendations = this.args.campaignTubeRecommendations.sortBy('averageScore');
    } else {
      this.sortedRecommendations = this.args.campaignTubeRecommendations.sortBy('averageScore').reverse();
    }
  }
}
