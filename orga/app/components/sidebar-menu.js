import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class SidebarMenu extends Component {
  @service currentUser;

  get documentationUrl() {
    if (this.currentUser.isSCOManagingStudents && this.currentUser.isAgriculture) {
      return 'https://view.genial.ly/5f85a0b87812e90d12b7b593';
    }

    if (this.currentUser.isSCOManagingStudents) {
      return 'https://view.genial.ly/5f3e7a5ba8ffb90d11ac034f';
    }

    if (this.currentUser.organization.isPro) {
      return 'https://cloud.pix.fr/s/cwZN2GAbqSPGnw4';
    }

    return null;
  }
}
