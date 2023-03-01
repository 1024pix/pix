import Service from '@ember/service';
import { inject as service } from '@ember/service';

export default class AccessControlService extends Service {
  @service currentUser;
  @service router;

  get hasAccessToUsersActionsScope() {
    return this.currentUser.adminMember.isSuperAdmin || this.currentUser.adminMember.isSupport;
  }

  get hasAccessToTargetProfilesActionsScope() {
    return !!(
      this.currentUser.adminMember.isSuperAdmin ||
      this.currentUser.adminMember.isSupport ||
      this.currentUser.adminMember.isMetier
    );
  }

  get hasAccessToTrainingsActionsScope() {
    return this.currentUser.adminMember.isSuperAdmin || this.currentUser.adminMember.isMetier;
  }

  get hasAccessToTrainings() {
    return (
      this.currentUser.adminMember.isSuperAdmin ||
      this.currentUser.adminMember.isMetier ||
      this.currentUser.adminMember.isSupport
    );
  }

  restrictAccessTo(roles, redirectionUrl) {
    const currentUserIsAllowed = roles.some((role) => this.currentUser.adminMember[role]);
    if (!currentUserIsAllowed) {
      this.router.transitionTo(redirectionUrl);
    }
  }

  get hasAccessToOrganizationActionsScope() {
    return !!(
      this.currentUser.adminMember.isSuperAdmin ||
      this.currentUser.adminMember.isSupport ||
      this.currentUser.adminMember.isMetier
    );
  }

  get hasAccessToCertificationActionsScope() {
    return !!(
      this.currentUser.adminMember.isSuperAdmin ||
      this.currentUser.adminMember.isSupport ||
      this.currentUser.adminMember.isCertif
    );
  }

  get hasAccessToOrganizationPlacesActionsScope() {
    return !!(this.currentUser.adminMember.isSuperAdmin || this.currentUser.adminMember.isMetier);
  }
}
