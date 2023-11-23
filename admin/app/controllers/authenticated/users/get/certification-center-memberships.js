import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class UsersCertificationCenterMembershipsController extends Controller {
  @service notifications;

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
