import { service } from '@ember/service';
import Component from '@glimmer/component';
import groupBy from 'lodash/groupBy';
import uniq from 'lodash/uniq';

export default class Import extends Component {
  @service currentUser;
  @service session;
  @service errorMessages;
  @service intl;

  get displayImportMessagePanel() {
    return this.args.organizationImport?.hasError || this.args.organizationImport?.hasWarning;
  }

  get displayBanner() {
    return this.args.isLoading || this.args.organizationImport?.hasWarning;
  }

  get panelClasses() {
    const classes = ['import-students-page__error-panel'];

    if (this.args.organizationImport?.hasWarning) classes.push('import-students-page__error-panel--warning');

    return classes.join(' ').trim();
  }

  get bannerType() {
    if (this.args.organizationImport?.hasWarning) {
      return 'warning';
    } else {
      return 'information';
    }
  }

  get bannerMessage() {
    if (this.args.organizationImport?.hasWarning) {
      return this.intl.t('pages.organization-participants-import.warning-banner', { htmlSafe: true });
    }
    return this.intl.t('pages.organization-participants-import.information');
  }

  get errorDetailList() {
    if (this.args.organizationImport?.hasWarning) {
      const warnings = [];
      const warningsByFields = groupBy(this.args.organizationImport?.errors, 'field');
      if (warningsByFields.diploma) {
        const diplomas = uniq(warningsByFields.diploma.map((warning) => warning.value)).join(', ');
        warnings.push(this.intl.t('pages.organization-participants-import.warnings.diploma', { diplomas }));
      }
      if (warningsByFields['study-scheme']) {
        const studySchemes = uniq(warningsByFields['study-scheme'].map((warning) => warning.value)).join(', ');
        warnings.push(this.intl.t('pages.organization-participants-import.warnings.study-scheme', { studySchemes }));
      }
      return warnings;
    }
    return this.args.organizationImport?.errors.map((error) =>
      this.errorMessages.getErrorMessage(error.code, error.meta),
    );
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
