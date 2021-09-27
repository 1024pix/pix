import Component from '@glimmer/component';

export default class Header extends Component {
  get displayBadges() {
    const { campaign, participation } = this.args;
    return campaign.hasBadges && participation.badges.length > 0;
  }
}
