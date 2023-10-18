import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class PanelHeader extends Component {
  @service currentUser;
  @service currentDomain;
  @service intl;

  get shouldRenderImportTemplateButton() {
    const topLevelDomain = this.currentDomain.getExtension();
    const currentLanguage = this.intl.t('current-lang');
    const isOrgTldAndEnglishCurrentLanguage = topLevelDomain === 'org' && currentLanguage === 'en';

    return (
      !this.currentUser.currentAllowedCertificationCenterAccess.isScoManagingStudents &&
      !isOrgTldAndEnglishCurrentLanguage
    );
  }
}
