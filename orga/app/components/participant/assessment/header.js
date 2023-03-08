import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class Header extends Component {
  @service intl;

  get displayBadges() {
    const { campaign, participation } = this.args;
    return campaign.hasBadges && participation.badges.length > 0;
  }

  get breadcrumbLinks() {
    return [
      {
        route: 'authenticated.campaigns',
        label: this.intl.t('navigation.main.campaigns'),
      },
      {
        route: 'authenticated.campaigns.campaign.activity',
        label: this.args.campaign.name,
        model: this.args.campaign.id,
      },
      {
        route: 'authenticated.campaigns.participant-assessment',
        label: this.intl.t('pages.assessment-individual-results.breadcrumb-current-page-label', {
          firstName: this.args.participation.firstName,
          lastName: this.args.participation.lastName,
        }),
        models: [this.args.campaign.id, this.args.participation.id],
      },
    ];
  }

  get valuePercentage() {
    return Math.round(this.args.participation.masteryRate * 100);
  }
}
