import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class CertificationCenterMemberships extends Component {
  @service notifications;

  get orderedCertificationCenterMemberships() {
    return this.args.certificationCenterMemberships.sortBy('certificationCenter.name');
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
