import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';

export default class SidebarMenu extends Component {
  @service currentUser;

  @computed('currentUser.organization')
  get documentationUrl() {
    if (this.currentUser.isSCOManagingStudents) {
      return 'https://cloud.pix.fr/s/rWcNFSgdnnNSdqF';
    }

    if (this.currentUser.organization.isPro) {
      return 'https://cloud.pix.fr/s/cwZN2GAbqSPGnw4';
    }

    return null;
  }
}
