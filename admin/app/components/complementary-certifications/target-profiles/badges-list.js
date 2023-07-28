import Component from '@glimmer/component';

export default class BadgeList extends Component {
  get currentTargetProfileBadges() {
    return this.args.currentTargetProfiles?.[0].badges;
  }
}
