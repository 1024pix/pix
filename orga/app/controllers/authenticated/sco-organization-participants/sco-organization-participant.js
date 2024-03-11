import Controller from '@ember/controller';
import { service } from '@ember/service';

export default class ScoOrganizationParticipant extends Controller {
  @service intl;
  @service currentUser;

  get hasComputeOrganizationLearnerCertificabilityEnabled() {
    return this.currentUser.prescriber.computeOrganizationLearnerCertificability;
  }

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
