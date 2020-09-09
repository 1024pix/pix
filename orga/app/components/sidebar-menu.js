import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { computed } from '@ember/object';

export default class SidebarMenu extends Component {
  @service currentUser;

  @computed('currentUser.organization')
  get documentationUrl() {
    if (this.currentUser.isSCOManagingStudents) {
      return 'https://view.genial.ly/5f3e7a5ba8ffb90d11ac034f';
    }

    if (this.currentUser.organization.isPro) {
      return 'https://cloud.pix.fr/s/cwZN2GAbqSPGnw4';
    }

    return null;
  }
}
