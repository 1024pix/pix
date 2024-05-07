import { action } from '@ember/object';
import { service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class Recommendations extends Component {
  @service intl;
  @tracked sortedRecommendations;
  @tracked order;

  constructor() {
    super(...arguments);

    Promise.resolve(this.args.campaignTubeRecommendations).then((recommendations) => {
      this.sortedRecommendations = recommendations
        ? recommendations.slice().sort((a, b) => {
            return a.averageScore - b.averageScore;
          })
        : [];
    });
  }

  get description() {
    return htmlSafe(
      this.intl.t('pages.campaign-review.description', {
        bubble:
          '<span aria-hidden="true" focusable="false">(<svg height="10" width="10" role="img"><circle cx="5" cy="5" r="5" class="campaign-details-analysis recommendation-indicator__bubble" /></svg>)</span>',
      }),
    );
  }

  @action
  async sortRecommendationOrder(order) {
    this.order = order;
    const campaignTubeRecommendations = this.args.campaignTubeRecommendations.slice();

    if (!this.sortedRecommendations) {
      return null;
    } else if (order === 'desc') {
      this.sortedRecommendations = campaignTubeRecommendations.sort((a, b) => {
        return a.averageScore - b.averageScore;
      });
    } else {
      this.sortedRecommendations = campaignTubeRecommendations.sort((a, b) => {
        return b.averageScore - a.averageScore;
      });
    }
  }
}
