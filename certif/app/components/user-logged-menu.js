import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class UserLoggedMenu extends Component {
  @service currentUser;
  @service router;

  @tracked isMenuOpen = false;

  get certificationCenterNameAndExternalId() {
    const allowedCertificationCenterAccess = this.currentUser.currentAllowedCertificationCenterAccess;

    if (allowedCertificationCenterAccess.externalId) {
      return `${allowedCertificationCenterAccess.name} (${allowedCertificationCenterAccess.externalId})`;
    }
    return allowedCertificationCenterAccess.name;
  }

  get userFullName() {
    const certificationPointOfContact = this.currentUser.certificationPointOfContact;
    return `${certificationPointOfContact.firstName} ${certificationPointOfContact.lastName}`;
  }

  get eligibleCertificationCenterAccesses() {
    const allowedCertificationCenterAccesses =
      this.currentUser.certificationPointOfContact.allowedCertificationCenterAccesses;

    if (!allowedCertificationCenterAccesses) {
      return [];
    }
    return allowedCertificationCenterAccesses
      .filter((allowedCertificationCenterAccess) => {
        return allowedCertificationCenterAccess.id !== this.currentUser.currentAllowedCertificationCenterAccess.id;
      })
      .sortBy('name');
  }

  @action
  closeMenu() {
    this.isMenuOpen = false;
  }

  @action
  onCertificationCenterAccessChanged(certificationCenterAccess) {
    this.closeMenu();
    return this.args.onCertificationCenterAccessChanged(certificationCenterAccess);
  }
}
