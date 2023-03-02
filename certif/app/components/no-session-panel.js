import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class PanelHeader extends Component {
  @service featureToggles;
  @service currentUser;

  get isScoManagingStudents() {
    return this.currentUser.currentAllowedCertificationCenterAccess.isScoManagingStudents;
  }

  get shouldRenderImportTemplateButton() {
    return this.featureToggles.featureToggles.isMassiveSessionManagementEnabled && !this.isScoManagingStudents;
  }
}
