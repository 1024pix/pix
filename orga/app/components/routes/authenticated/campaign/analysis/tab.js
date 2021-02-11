import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class Tab extends Component {
  @tracked
  sortedRecommendations;

  constructor() {
    super(...arguments);
    this.sortedRecommendations = this.args.campaignTubeRecommendations
      ? this.args.campaignTubeRecommendations.sortBy('averageScore')
      : [];
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
