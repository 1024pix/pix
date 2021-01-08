import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class UserLoggedMenu extends Component {

  @service currentUser;

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

  @action
  closeMenu() {
    this.isMenuOpen = false;
  }
}
