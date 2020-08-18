import Component from '@glimmer/component';
import range from 'lodash/range';

export default class ReachedStage extends Component {

  get acquiredStars() {
    return range(1, this.args.starCount);
  }

  get unacquiredStars() {
    return range(this.args.starCount, this.args.stageCount);
  }
}

