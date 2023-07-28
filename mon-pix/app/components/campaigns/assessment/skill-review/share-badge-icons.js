import Component from '@glimmer/component';

export default class SkillReviewCompetenceStagesResult extends Component {
  get badgesToShow() {
    return this.args.badges.filter((badge) => badge.isAcquired && badge.isValid);
  }

  get showBadgeIcons() {
    return this.badgesToShow.length > 0;
  }
}
