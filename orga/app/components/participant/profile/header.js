import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class Header extends Component {
  @service intl;

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
        route: 'authenticated.campaigns.participant-profile',
        label: this.intl.t('pages.profiles-individual-results.breadcrumb-current-page-label', {
          firstName: this.args.campaignProfile.firstName,
          lastName: this.args.campaignProfile.lastName,
        }),
        models: [this.args.campaign.id, this.args.campaignParticipationId],
      },
    ];
  }
}
