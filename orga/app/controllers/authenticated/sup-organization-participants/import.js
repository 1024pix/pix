import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import get from 'lodash/get';
import groupBy from 'lodash/groupBy';
import isEmpty from 'lodash/isEmpty';
import uniq from 'lodash/uniq';

export default class ImportController extends Controller {
  @service currentUser;
  @service session;
  @service intl;
  @service notifications;
  @service errorMessages;
  @service store;
  @service router;

  @tracked isLoading = false;

  @action
  async importStudents(files) {
    const adapter = this.store.adapterFor('students-import');
    const organizationId = this.currentUser.organization.id;

    this.isLoading = true;
    this.notifications.clearAll();
    try {
      const response = await adapter.addStudentsCsv(organizationId, files);
      this._sendNotifications(response);
      this.router.transitionTo('authenticated.sup-organization-participants.list');
    } catch (errorResponse) {
      this._sendErrorNotifications(errorResponse);
    } finally {
      this.isLoading = false;
    }
  }

  @action
  async replaceStudents(files) {
    const adapter = this.store.adapterFor('students-import');
    const organizationId = this.currentUser.organization.id;

    this.isLoading = true;
    this.notifications.clearAll();
    try {
      const response = await adapter.replaceStudentsCsv(organizationId, files);
      this._sendNotifications(response);
      this.router.transitionTo('authenticated.sup-organization-participants.list');
    } catch (errorResponse) {
      this._sendErrorNotifications(errorResponse);
    } finally {
      this.isLoading = false;
    }
  }

  _sendNotifications(response) {
    const warningsArray = get(response, 'data.attributes.warnings', []);
    if (isEmpty(warningsArray)) {
      return this.notifications.sendSuccess(this.intl.t('pages.sup-organization-participants-import.global-success'));
    }

    const warnings = groupBy(warningsArray, 'field');
    const warningMessages = [];
    if (warnings.diploma) {
      const diplomas = uniq(warnings.diploma.map((warning) => warning.value)).join(', ');
      warningMessages.push(this.intl.t('pages.sup-organization-participants-import.warnings.diploma', { diplomas }));
    }
    if (warnings['study-scheme']) {
      const studySchemes = uniq(warnings['study-scheme'].map((warning) => warning.value)).join(', ');
      warningMessages.push(
        this.intl.t('pages.sup-organization-participants-import.warnings.study-scheme', { studySchemes }),
      );
    }
    return this.notifications.sendWarning(
      this.intl.t('pages.sup-organization-participants-import.global-success-with-warnings', {
        warnings: warningMessages.join(''),
        htmlSafe: true,
      }),
    );
  }

  _sendErrorNotifications(errorResponse) {
    const globalErrorMessage = this.intl.t('pages.sup-organization-participants-import.global-error', {
      htmlSafe: true,
    });
    if (errorResponse.errors) {
      errorResponse.errors.forEach((error) => {
        if (error.status === '412' || error.status === '413') {
          const message = this.errorMessages.getErrorMessage(error.code, error.meta) || error.detail;
          return this.notifications.sendError(
            this.intl.t('pages.sup-organization-participants-import.error-wrapper', { message, htmlSafe: true }),
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
}
