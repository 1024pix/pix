import Component from '@glimmer/component';

export default class Details extends Component {

  get displayBadges() {
    return this.args.campaign.hasBadges && this.args.campaignAssessmentParticipation.badges.length > 0;
  }
}
