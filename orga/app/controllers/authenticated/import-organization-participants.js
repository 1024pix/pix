import { action } from '@ember/object';
import { service } from '@ember/service';
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import groupBy from 'lodash/groupBy';
import uniq from 'lodash/uniq';

export default class ImportController extends Controller {
  @service currentUser;
  @service session;
  @service intl;
  @service notifications;
  @service errorMessages;
  @service store;

  @tracked isLoading = false;
  @tracked errors = null;
  @tracked warnings = null;
  @tracked warningBanner = null;

  @action
  async importSupStudents(files) {
    this._initializeUpload();

    const adapter = this.store.adapterFor('students-import');
    const organizationId = this.currentUser.organization.id;

    try {
      const response = await adapter.addStudentsCsv(organizationId, files);
      this._sendSupNotifications(response);
    } catch (errorResponse) {
      this._instantiateErrorsDetail(errorResponse);
    } finally {
      this.isLoading = false;
    }
  }

  @action
  async importScoStudents(files) {
    this._initializeUpload();

    const adapter = this.store.adapterFor('students-import');
    const organizationId = this.currentUser.organization.id;
    const format = this.currentUser.isAgriculture ? 'csv' : 'xml';

    const confirmBeforeClose = (event) => {
      event.preventDefault();
      return (event.returnValue = '');
    };
    window.addEventListener('beforeunload', confirmBeforeClose);

    try {
      await adapter.importStudentsSiecle(organizationId, files, format);
      this.notifications.sendSuccess(this.intl.t('pages.organization-participants-import.global-success'));
    } catch (errorResponse) {
      this._instantiateErrorsDetail(errorResponse);
    } finally {
      this.isLoading = false;
      window.removeEventListener('beforeunload', confirmBeforeClose);
    }
  }

  @action
  async replaceStudents(files) {
    this._initializeUpload();

    const adapter = this.store.adapterFor('students-import');
    const organizationId = this.currentUser.organization.id;

    try {
      const response = await adapter.replaceStudentsCsv(organizationId, files);
      this._sendSupNotifications(response);
    } catch (errorResponse) {
      this._instantiateErrorsDetail(errorResponse);
    } finally {
      this.isLoading = false;
    }
  }

  _sendSupNotifications(response) {
    const warningsArray = get(response, 'data.attributes.warnings', []);

    this.notifications.sendSuccess(this.intl.t('pages.organization-participants-import.global-success'));

    if (isEmpty(warningsArray.length)) {
      const warnings = groupBy(warningsArray, 'field');

      this.warnings = [];
      this.warningBanner = this.intl.t('pages.organization-participants-import.warning-banner', { htmlSafe: true });

      if (warnings.diploma) {
        const diplomas = uniq(warnings.diploma.map((warning) => warning.value)).join(', ');
        this.warnings.push(this.intl.t('pages.organization-participants-import.warnings.diploma', { diplomas }));
      }
      if (warnings['study-scheme']) {
        const studySchemes = uniq(warnings['study-scheme'].map((warning) => warning.value)).join(', ');
        this.warnings.push(
          this.intl.t('pages.organization-participants-import.warnings.study-scheme', { studySchemes }),
        );
      }
    }
  }

  _initializeUpload() {
    if (this.isLoading) return;

    this.isLoading = true;
    this.notifications.clearAll();

    this.errors = null;
    this.warnings = null;
    this.warningBanner = null;
  }

  _instantiateErrorsDetail(errorResponse) {
    this.errors = [];
    if (!errorResponse.errors) {
      this.notifications.sendError(
        this.intl.t('pages.organization-participants-import.error-panel.global-error', {
          htmlSafe: true,
        }),
        {
          onClick: () => window.open(this.intl.t('common.help-form'), '_blank'),
        },
      );
    } else {
      this.notifications.sendError(
        this.intl.t('pages.organization-participants-import.error-panel.error-wrapper', {
          htmlSafe: true,
        }),
        {
          onClick: () => window.open(this.intl.t('common.help-form'), '_blank'),
        },
      );

      errorResponse.errors.forEach((error) => {
        if (['422', '412', '413'].includes(error.status)) {
          const message = this.errorMessages.getErrorMessage(error.code, error.meta) || error.detail;
          this.errors.push(message);
        }
      });
    }
  }
}
