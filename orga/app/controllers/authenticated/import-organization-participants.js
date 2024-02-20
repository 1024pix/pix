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

  @action
  async importSupStudents(files) {
    if (this.isLoading) return;

    const adapter = this.store.adapterFor('students-import');
    const organizationId = this.currentUser.organization.id;

    this.notifications.clearAll();
    try {
      this.isLoading = true;
      const response = await adapter.addStudentsCsv(organizationId, files);
      this._sendNotifications(response);
    } catch (errorResponse) {
      this._sendErrorNotifications(errorResponse);
    } finally {
      this.isLoading = false;
    }
  }

  @action
  async importScoStudents(files) {
    if (this.isLoading) return;

    const adapter = this.store.adapterFor('students-import');
    const organizationId = this.currentUser.organization.id;

    const confirmBeforeClose = (event) => {
      event.preventDefault();
      return (event.returnValue = '');
    };

    window.addEventListener('beforeunload', confirmBeforeClose);
    this.isLoading = true;
    this.notifications.clearAll();
    try {
      const format = this.currentUser.isAgriculture ? 'csv' : 'xml';
      await adapter.importStudentsSiecle(organizationId, files, format);
      this.notifications.sendSuccess(this.intl.t('pages.organization-participants-import.global-success'));
    } catch (errorResponse) {
      this._handleError(errorResponse);
    } finally {
      this.isLoading = false;
      window.removeEventListener('beforeunload', confirmBeforeClose);
    }
  }

  @action
  async replaceStudents(files) {
    if (this.isLoading) return;

    this.notifications.clearAll();

    const adapter = this.store.adapterFor('students-import');
    const organizationId = this.currentUser.organization.id;

    try {
      this.isLoading = true;
      const response = await adapter.replaceStudentsCsv(organizationId, files);
      this._sendNotifications(response);
    } catch (errorResponse) {
      this._sendErrorNotifications(errorResponse);
    } finally {
      this.isLoading = false;
    }
  }

  _sendNotifications(response) {
    const warningsArray = get(response, 'data.attributes.warnings', []);
    if (isEmpty(warningsArray)) {
      return this.notifications.sendSuccess(this.intl.t('pages.organization-participants-import.global-success'));
    }

    const warnings = groupBy(warningsArray, 'field');
    const warningMessages = [];
    if (warnings.diploma) {
      const diplomas = uniq(warnings.diploma.map((warning) => warning.value)).join(', ');
      warningMessages.push(this.intl.t('pages.organization-participants-import.warnings.diploma', { diplomas }));
    }
    if (warnings['study-scheme']) {
      const studySchemes = uniq(warnings['study-scheme'].map((warning) => warning.value)).join(', ');
      warningMessages.push(
        this.intl.t('pages.organization-participants-import.warnings.study-scheme', { studySchemes }),
      );
    }
    return this.notifications.sendWarning(
      this.intl.t('pages.organization-participants-import.global-success-with-warnings', {
        warnings: warningMessages.join(''),
        htmlSafe: true,
      }),
    );
  }

  _sendErrorNotifications(errorResponse) {
    const globalErrorMessage = this.intl.t('pages.organization-participants-import.sup.global-error', {
      htmlSafe: true,
    });
    if (errorResponse.errors) {
      errorResponse.errors.forEach((error) => {
        if (error.status === '412' || error.status === '413') {
          const message = this.errorMessages.getErrorMessage(error.code, error.meta) || error.detail;
          return this.notifications.sendError(
            this.intl.t('pages.organization-participants-import.sup.error-wrapper', { message, htmlSafe: true }),
          );
        }
        return this.notifications.sendError(globalErrorMessage, {
          onClick: () => window.open(this.intl.t('common.help-form'), '_blank'),
        });
      });
    } else {
      return this.notifications.sendError(globalErrorMessage, {
        onClick: () => window.open(this.intl.t('common.help-form'), '_blank'),
      });
    }
  }

  _handleError(errorResponse) {
    const globalErrorMessage = this.intl.t('pages.organization-participants-import.sco.global-error', {
      htmlSafe: true,
    });
    if (!errorResponse.errors) {
      return this.notifications.sendError(globalErrorMessage, {
        onClick: () => window.open(this.intl.t('common.help-form'), '_blank'),
      });
    }

    errorResponse.errors.forEach((error) => {
      if (['422', '412', '413'].includes(error.status)) {
        const message = this.errorMessages.getErrorMessage(error.code, error.meta) || error.detail;
        return this.notifications.sendError(
          this.intl.t('pages.organization-participants-import.sco.error-wrapper', { message, htmlSafe: true }),
        );
      }
      return this.notifications.sendError(globalErrorMessage, {
        onClick: () => window.open(this.intl.t('common.help-form'), '_blank'),
      });
    });
  }
}
