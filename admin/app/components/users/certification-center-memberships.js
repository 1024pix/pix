import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

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
