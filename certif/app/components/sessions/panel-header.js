import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class PanelHeader extends Component {
  @service featureToggles;
  @service currentUser;
  @service currentDomain;
  @service intl;

  get shouldRenderImportTemplateButton() {
    const topLevelDomain = this.currentDomain.getExtension();
    const currentLanguage = this.intl.t('current-lang');
    const isOrgTldAndEnglishCurrentLanguage = topLevelDomain === 'org' && currentLanguage === 'en';

    return (
      this.featureToggles.featureToggles.isMassiveSessionManagementEnabled &&
      !this.currentUser.currentAllowedCertificationCenterAccess.isScoManagingStudents &&
      !isOrgTldAndEnglishCurrentLanguage
    );
  }
}
