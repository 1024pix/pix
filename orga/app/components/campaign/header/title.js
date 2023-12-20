import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class Header extends Component {
  @service intl;
  @service currentUser;

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
    ];
  }

  get labels() {
    return {
      ASSESSMENT: 'components.campaign.type.explanation.ASSESSMENT',
      PROFILES_COLLECTION: 'components.campaign.type.explanation.PROFILES_COLLECTION',
    };
  }

  get shouldShowMultipleSending() {
    return this.args.campaign.isTypeProfilesCollection || this.isMultipleSendingsForAssessmentEnabled;
  }

  get isMultipleSendingsForAssessmentEnabled() {
    return this.args.campaign.isTypeAssessment && this.currentUser.prescriber.enableMultipleSendingAssessment;
  }

  get multipleSendingText() {
    return this.args.campaign.multipleSendings
      ? this.intl.t('pages.campaign.multiple-sendings.status.enabled')
      : this.intl.t('pages.campaign.multiple-sendings.status.disabled');
  }
}
