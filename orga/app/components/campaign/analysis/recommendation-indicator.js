import Component from '@glimmer/component';

const RECOMMENDED = 75;
const HIGHLY_RECOMMENDED = 50;
const STRONGLY_RECOMMENDED = 25;

export default class RecommendationIndicator extends Component {

  get bubblesCount() {
    const value = this.args.value;
    if (value <= STRONGLY_RECOMMENDED) return 4;
    if (value <= HIGHLY_RECOMMENDED) return 3;
    if (value <= RECOMMENDED) return 2;
    return 1;
  }

  get bubbles() {
    return new Array(this.bubblesCount);
  }

  get label() {
    const value = this.args.value;
    if (value <= STRONGLY_RECOMMENDED) return 'Fortement recommandé';
    if (value <= HIGHLY_RECOMMENDED) return 'Très recommandé';
    if (value <= RECOMMENDED) return 'Recommandé';
    return 'Assez recommandé';
  }

  get bubbleWidth() {
    return 12 * this.bubblesCount;
  }

  get xBubbleCoordinate() {
    return 5 * this.bubbles.length;
  }
}
