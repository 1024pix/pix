import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class Import extends Component {
  @service currentUser;
  @service session;
  @service intl;

  get displayErrorImportPanel() {
    return Boolean(this.args.errors) || this.hasWarnings;
  }

  get hasWarnings() {
    return Boolean(this.args.warnings);
  }

  get displayBanner() {
    return this.args.isLoading || Boolean(this.args.warningBanner);
  }

  get panelClasses() {
    const classes = ['import-students-page__error-panel'];

    if (this.hasWarnings) classes.push('import-students-page__error-panel--warning');

    return classes.join(' ');
  }

  get bannerType() {
    if (this.hasWarnings) {
      return 'warning';
    } else {
      return 'information';
    }
  }

  get bannerMessage() {
    if (this.hasWarnings) return this.args.warningBanner;

    return this.intl.t('pages.organization-participants-import.information');
  }

  get errorDetailList() {
    return this.args.errors || this.args.warnings;
  }

  get supportedFormats() {
    if (
      (this.currentUser.isSCOManagingStudents && this.currentUser.isAgriculture) ||
      this.currentUser.isSUPManagingStudents
    ) {
      return ['.csv'];
    } else if (this.currentUser.isSCOManagingStudents) {
      return ['.xml', '.zip'];
    } else return [];
  }

  get acceptedFileType() {
    const types = this.supportedFormats.join(this.intl.t('pages.organization-participants-import.file-type-separator'));
    return this.intl.t('pages.organization-participants-import.supported-formats', { types });
  }

  get textsByOrganizationType() {
    if (this.currentUser.isSCOManagingStudents) {
      return {
        title: 'pages.organization-participants-import.sco.title',
        'error-wrapper': 'pages.organization-participants-import.sco.error-wrapper',
        'global-error': 'pages.organization-participants-import.sco.title.global-error',
      };
    } else if (this.currentUser.isSUPManagingStudents) {
      return {
        title: 'pages.organization-participants-import.sup.title',
        'error-wrapper': 'pages.organization-participants-import.sup.error-wrapper',
        'global-error': 'pages.organization-participants-import.sup.title.global-error',
      };
    } else {
      return {};
    }
  }
}
