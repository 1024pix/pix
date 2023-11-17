import Component from '@glimmer/component';

export default class ShareBadgeIcons extends Component {
  get acquiredAndValidBadges() {
    const acquiredAndValidBadges = this.args.badges.filter((badge) => badge.isAcquired && badge.isValid);
    const badgesCertifiableFirst = acquiredAndValidBadges.sort((a) => {
      return a.isCertifiable ? -1 : 1;
    });
    return badgesCertifiableFirst;
  }

  get showBadgeIcons() {
    return this.acquiredAndValidBadges.length > 0;
  }
}
