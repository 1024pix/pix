import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class SidebarMenu extends Component {
  @service currentUser;
  @service url;

  get documentationUrl() {
    if (!this.url.isFrenchDomainExtension) {
      return 'https://cloud.pix.fr/s/HxpfpBnY47nYBkz';
    }

    if (this.currentUser.isSCOManagingStudents && this.currentUser.isAgriculture) {
      return 'https://view.genial.ly/5f85a0b87812e90d12b7b593';
    }

    if (this.currentUser.isSCOManagingStudents) {
      return 'https://view.genial.ly/5f3e7a5ba8ffb90d11ac034f';
    }

    if (this.currentUser.isAEFE || this.currentUser.isMLF) {
      return 'https://view.genial.ly/5ffb6eed1ac90d0d0daf65d8';
    }

    if (this.currentUser.isMediationNumerique) {
      return 'https://view.genial.ly/6048a0d3757f980dc010d6d4';
    }

    if (this.currentUser.organization.isPro) {
      return 'https://cloud.pix.fr/s/cwZN2GAbqSPGnw4';
    }

    if (this.currentUser.organization.isSup) {
      return 'https://cloud.pix.fr/s/DTTo7Lp7p6Ktceo';
    }

    return null;
  }

  get shouldDisplayCertificationsEntry() {
    return this.currentUser.isAdminInOrganization && this.currentUser.isSCOManagingStudents;
  }
}
