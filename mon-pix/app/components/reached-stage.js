import Component from '@glimmer/component';
import range from 'lodash/range';

export default class ReachedStage extends Component {

  get firstStar() {
    return this._stars[0];
  }

  get otherStars() {
    return this._stars.slice(1);
  }

  get acquiredStarsCount() {
    return this._acquiredStars.length;
  }

  get totalStarsCount() {
    return this._stars.length;
  }

  get _stars() {
    return this._acquiredStars.concat(this._unacquiredStars);
  }

  get _acquiredStars() {
    if (this.args.starCount < 1) {
      return [];
    }
    return range(1, this.args.starCount)
      .map(() => {
        return { status: 'acquired', imageSrc: 'stage-plain-star.svg' };
      });
  }

  get _unacquiredStars() {
    return range(this.args.starCount, this.args.stageCount)
      .map(() => {
        return { status: 'unacquired', imageSrc: 'stage-clear-star.svg' };
      });
  }
}

