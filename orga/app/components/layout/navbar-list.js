import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class NavbarList extends Component {
  @service currentUser;
  @service url;

  get documentationUrl() {
    return this.currentUser.organization.documentationUrl;
  }

  get shouldDisplayCertificationsEntry() {
    return this.currentUser.isAdminInOrganization && this.currentUser.isSCOManagingStudents;
  }

  get isNotManagingStudents() {
    return !this.currentUser.isSCOManagingStudents && !this.currentUser.isSUPManagingStudents;
  }
}
