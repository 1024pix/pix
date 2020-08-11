import Component from '@glimmer/component';
import range from 'lodash/range';

export default class ReachedStage extends Component {

  get acquiredStars() {
    // returns an array of [1...N] where N is the number of acquired stars
    return range(1, this.args.starCount + 1);
  }

  get unacquiredStars() {
    // returns an array of [N+1...M] where N is the number of acquired stars and M the total number of stages (stars)
    return range(this.args.starCount + 1, this.args.stageCount + 1);
  }
}

