import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class UserLoggedMenu extends Component {

  @service currentUser;
  @service router;

  @tracked isMenuOpen = false;

  get certificationCenterNameAndExternalId() {
    const certificationCenter = this.currentUser.currentCertificationCenter;

    if (certificationCenter.externalId) {
      return `${certificationCenter.name} (${certificationCenter.externalId})`;
    }
    return certificationCenter.name;
  }

  get userFullName() {
    const certificationPointOfContact = this.currentUser.certificationPointOfContact;
    return `${certificationPointOfContact.firstName} ${certificationPointOfContact.lastName}`;
  }

  get eligibleCertificationCenters() {
    const certificationCenters = this.currentUser.certificationPointOfContact.certificationCenters;

    if (!certificationCenters) {
      return [];
    }
    return certificationCenters
      .filter((certificationCenter) => {
        return parseInt(certificationCenter.id) !== this.currentUser.certificationPointOfContact.currentCertificationCenterId;
      })
      .sortBy('name');
  }

  @action
  closeMenu() {
    this.isMenuOpen = false;
  }

  @action
  async onCertificationCenterChange(certificationCenter) {
    this.currentUser.certificationPointOfContact.currentCertificationCenterId = parseInt(certificationCenter.id);

    this.closeMenu();

    this.router.replaceWith('authenticated');
  }
}
