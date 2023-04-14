import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class ListSummaryItems extends Component {
  @service featureToggles;

  get isTrainingRecommendationEnabled() {
    return this.featureToggles.featureToggles.isTrainingRecommendationEnabled;
  }
}
