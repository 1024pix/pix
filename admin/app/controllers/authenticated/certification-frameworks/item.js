import Controller from '@ember/controller';
import { service } from '@ember/service';

export default class CertificationFrameworkItem extends Controller {
  @service router;
  @service currentUser;

  get showCreationVersionButton() {
    if (
      this.currentUser.adminMember.isSuperAdmin &&
      this.router.currentRouteName === 'authenticated.certification-frameworks.item.frameworks.index' &&
      this.model.certificationFramework?.name !== 'CLEA'
    ) {
      return true;
    }
    return false;
  }
}
