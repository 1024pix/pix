import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import dayjs from 'dayjs';

export default class Header extends Component {
  @service intl;
  @service currentUser;
  @service router;

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

  get percentage() {
    return Math.round(this.args.participation.masteryRate * 100);
  }

  get participationsListOptions() {
    let participationNumber = 0;
    const options = this.args.allParticipations.map((participation) => {
      participationNumber++;

      let category;
      let label = this.intl.t('pages.assessment-individual-results.participation-label', { participationNumber });

      if (participation.sharedAt) {
        const participationDate = dayjs(participation.sharedAt).format('DD/MM/YYYY');
        label = `${label} - ${participationDate}`;
      }

      if (participation.status === 'SHARED') {
        category = `— ${this.intl.t('pages.assessment-individual-results.participation-shared')} —`;
      } else if (participation.status === 'TO_SHARE') {
        category = `— ${this.intl.t('pages.assessment-individual-results.participation-to-share')} —`;
      }

      return {
        id: participationNumber,
        value: participation.id,
        label,
        category,
      };
    });

    return options;
  }

  get selectedParticipation() {
    return this.participationsListOptions.find((participation) => participation.value === this.args.participation.id);
  }

  @action
  selectAParticipation(participationId) {
    this.router.transitionTo('authenticated.campaigns.participant-assessment', this.args.campaign.id, participationId);
  }
}
