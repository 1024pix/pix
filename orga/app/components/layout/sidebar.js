import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class SidebarMenu extends Component {
  @service currentUser;
  @service url;

  get redirectionRoute() {
    if (this.shouldDisplayMissionsEntry) {
      return 'authenticated.missions';
    } else {
      return 'authenticated.campaigns';
    }
  }

  get documentationUrl() {
    return this.currentUser.organization.documentationUrl;
  }

  get shouldDisplayCertificationsEntry() {
    return this.currentUser.isAdminInOrganization && this.currentUser.isSCOManagingStudents;
  }

  get shouldDisplayPlacesEntry() {
    return this.currentUser.canAccessPlacesPage;
  }
  get shouldDisplayMissionsEntry() {
    return this.currentUser.canAccessMissionsPage;
  }
  get shouldDisplayCampaignsEntry() {
    return this.currentUser.canAccessCampaignsPage;
  }
  get shouldDisplayParticipantsEntry() {
    return this.currentUser.canAccessParticipantsPage;
  }

  get organizationLearnersList() {
    if (this.currentUser.isSCOManagingStudents) {
      return {
        route: 'authenticated.sco-organization-participants',
        label: 'navigation.main.sco-organization-participants',
      };
    } else if (this.currentUser.isSUPManagingStudents) {
      return {
        route: 'authenticated.sup-organization-participants',
        label: 'navigation.main.sup-organization-participants',
      };
    } else {
      return {
        route: 'authenticated.organization-participants',
        label: 'navigation.main.organization-participants',
      };
    }
  }
}
