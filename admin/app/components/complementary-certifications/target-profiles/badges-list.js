import Component from '@glimmer/component';

export default class BadgesList extends Component {
  get currentTargetProfileBadges() {
    return this.args.currentTargetProfile?.badges;
  }
}
