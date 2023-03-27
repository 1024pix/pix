import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default class ScoOrganizationParticipant extends Controller {
  @service intl;

  get breadcrumbLinks() {
    return [
      {
        route: 'authenticated.sco-organization-participants',
        label: this.intl.t('navigation.main.sco-organization-participants'),
      },
      {
        route: 'authenticated.sco-organization-participants.sco-organization-participant',
        label: this.intl.t('common.fullname', {
          firstName: this.model.organizationLearner.firstName,
          lastName: this.model.organizationLearner.lastName,
        }),
      },
    ];
  }
}
