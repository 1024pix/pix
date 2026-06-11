import Controller from '@ember/controller';
import { service } from '@ember/service';

export default class CertificationFrameworkItem extends Controller {
  @service router;
  @service currentUser;

  get showCreationVersionButton() {
    if (
      !this.currentUser.adminMember.isSuperAdmin ||
      this.model.certificationFramework?.name === 'CLEA' ||
      this.router.currentRouteName !== 'authenticated.certification-frameworks.item.framework.index'
    )
      return false;
    return true;
  }
}
