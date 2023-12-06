import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class PanelHeader extends Component {
  @service currentUser;
  @service currentDomain;
  @service intl;

  get isScoManagingStudents() {
    return this.currentUser.currentAllowedCertificationCenterAccess.isScoManagingStudents;
  }

  get shouldRenderImportTemplateButton() {
    const topLevelDomain = this.currentDomain.getExtension();
    const currentLanguage = this.intl.primaryLocale;
    const isOrgTldAndEnglishCurrentLanguage = topLevelDomain === 'org' && currentLanguage === 'en';

    return !this.isScoManagingStudents && !isOrgTldAndEnglishCurrentLanguage;
  }
}
