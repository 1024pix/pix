import Component from '@glimmer/component';

export default class Badges extends Component {

  get hasBadges() {
    const badges = this.args.badges;
    return badges && badges.length > 0;
  }
}
