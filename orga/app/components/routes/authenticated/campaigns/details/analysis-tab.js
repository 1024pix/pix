import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class AnalysisTab extends Component {
  @tracked
  sortedRecommendations = this.args.campaignTubeRecommendations;

  constructor() {
    super(...arguments);
    this.sortRecommendationOrder('desc');
  }

  @action
  sortRecommendationOrder(order) {
    if (order === 'desc') {
      this.sortedRecommendations = this.sortedRecommendations.sortBy('averageScore');
    } else {
      this.sortedRecommendations = this.sortedRecommendations.sortBy('averageScore').reverse();
    }
  }
}
