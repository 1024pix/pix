import Service from '@ember/service';
import { inject as service } from '@ember/service';

export default class AccessControlService extends Service {
  @service currentUser;
  @service router;

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
}
