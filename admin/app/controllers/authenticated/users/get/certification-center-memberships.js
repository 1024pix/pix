import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class UsersCertificationCenterMembershipsController extends Controller {
  @service notifications;
  @service store;
  @service intl;

  @action
  async updateCertificationCenterMembershipRole(certificationCenterMembership) {
    try {
      await certificationCenterMembership.save();
      this.notifications.success(
        this.intl.t('pages.certification-centers.notifications.success.update-certification-center-membership-role'),
      );
    } catch (_) {
      certificationCenterMembership.rollbackAttributes();
      this.notifications.error(
        this.intl.t('pages.certification-centers.notifications.failure.update-certification-center-membership-role'),
      );
    }
  }

  @action
  async disableCertificationCenterMembership(certificationCenterMembership) {
    try {
      await certificationCenterMembership.destroyRecord();
      this.notifications.success('Le membre a correctement été désactivé.');
    } catch (e) {
      this.notifications.error("Une erreur est survenue, le membre n'a pas été désactivé.");
    }
  }
}
