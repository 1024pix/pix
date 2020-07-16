import Component from '@glimmer/component';
import range from 'lodash/range';

export default class ReachedStage extends Component {

  get acquiredStars() {
    return range(1, this.args.starCount + 1);
  }

  get unacquiredStars() {
    return range(this.args.starCount + 1, this.args.stageCount + 1);
  }
}

