import Component from '@glimmer/component';

export default class BadgesList extends Component {
  get currentTargetProfileBadges() {
    return this.args.currentTargetProfile?.badges;
  }

  getMinimumEarnedPixValue(minimumEarnedPix) {
    return minimumEarnedPix <= 0 ? '' : minimumEarnedPix;
  }
}
