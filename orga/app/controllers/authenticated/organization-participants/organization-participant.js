import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default class OrganizationParticipant extends Controller {
  @service intl;

  get breadcrumbLinks() {
    return [
      {
        route: 'authenticated.organization-participants',
        label: this.intl.t('navigation.main.organization-participants'),
      },
      {
        route: 'authenticated.organization-participants.organization-participant',
        label: this.intl.t('common.fullname', {
          firstName: this.model.firstName,
          lastName: this.model.lastName,
        }),
      },
    ];
  }
}
