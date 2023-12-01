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
        this.intl.t('pages.user-details.notifications.success.update-certification-center-membership-role'),
      );
    } catch (_) {
      certificationCenterMembership.rollbackAttributes();
      this.notifications.error(
        this.intl.t('pages.user-details.notifications.failure.update-certification-center-membership-role'),
      );
    }
  }

  @action
  async disableCertificationCenterMembership(certificationCenterMembership) {
    try {
      await certificationCenterMembership.destroyRecord();
      this.notifications.success(
        this.intl.t('pages.user-details.notifications.success.deactivate-certification-center-membership'),
      );
    } catch (e) {
      this.notifications.error(
        this.intl.t('pages.user-details.notifications.failure.deactivate-certification-center-membership'),
      );
    }
  }
}
