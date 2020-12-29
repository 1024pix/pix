import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class UserLoggedMenu extends Component {

  @service currentUser;

  @tracked isMenuOpen = false;

  get certificationCenterNameAndExternalId() {
    const certificationPointOfContact = this.currentUser.certificationPointOfContact;

    if (certificationPointOfContact.certificationCenterExternalId) {
      return `${certificationPointOfContact.certificationCenterName} (${certificationPointOfContact.certificationCenterExternalId})`;
    }
    return certificationPointOfContact.certificationCenterName;
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
