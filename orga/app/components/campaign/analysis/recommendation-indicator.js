import { service } from '@ember/service';
import Component from '@glimmer/component';

const RECOMMENDED = 75;
const STRONGLY_RECOMMENDED = 50;
const VERY_STRONGLY_RECOMMENDED = 25;

export default class RecommendationIndicator extends Component {
  @service intl;

  get bubblesCount() {
    const value = this.args.value;
    if (value <= VERY_STRONGLY_RECOMMENDED) return 4;
    if (value <= STRONGLY_RECOMMENDED) return 3;
    if (value <= RECOMMENDED) return 2;
    return 1;
  }

  get bubbles() {
    return new Array(this.bubblesCount);
  }

  get label() {
    const value = this.args.value;
    if (value <= VERY_STRONGLY_RECOMMENDED)
      return this.intl.t('pages.campaign-review.table.analysis.recommendations.very-strongly-recommended');
    if (value <= STRONGLY_RECOMMENDED)
      return this.intl.t('pages.campaign-review.table.analysis.recommendations.strongly-recommended');
    if (value <= RECOMMENDED) return this.intl.t('pages.campaign-review.table.analysis.recommendations.recommended');
    return this.intl.t('pages.campaign-review.table.analysis.recommendations.moderately-recommended');
  }

  get bubbleWidth() {
    return 12 * this.bubblesCount;
  }

  get xBubbleCoordinate() {
    return 5 * this.bubbles.length;
  }
}
