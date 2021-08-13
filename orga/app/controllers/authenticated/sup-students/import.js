import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import ENV from 'pix-orga/config/environment';
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

  @tracked isLoading = false;

  @action
  async importStudents(file) {
    const url = `${ENV.APP.API_HOST}/api/organizations/${this.currentUser.organization.id}/schooling-registrations/import-csv`;
    await this._uploadFile(url, file);
  }

  @action
  async replaceStudents(file) {
    const url = `${ENV.APP.API_HOST}/api/organizations/${this.currentUser.organization.id}/schooling-registrations/replace-csv`;
    await this._uploadFile(url, file);
  }

  async _uploadFile(url, file) {
    this.isLoading = true;
    this.notifications.clearAll();
    const { access_token } = this.session.data.authenticated;

    try {
      const response = await file.uploadBinary(url, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Accept-Language': this.currentUser.prescriber.lang,
        },
      });
      this._sendNotifications(response);
      this.transitionToRoute('authenticated.sup-students.list');
    } catch (errorResponse) {
      this._sendErrorNotifications(errorResponse);
    } finally {
      this.isLoading = false;
    }
  }

  _sendNotifications(response) {
    const warningsArray = get(response, 'body.data.attributes.warnings', []);
    if (isEmpty(warningsArray)) {
      this.notifications.sendSuccess(this.intl.t('pages.students-sup-import.global-success'));
    }

    const warnings = groupBy(warningsArray, 'field');
    const warningMessages = [];
    if (warnings.diploma) {
      const diplomas = uniq(warnings.diploma.map((warning) => warning.value)).join(', ');
      warningMessages.push(this.intl.t('pages.students-sup-import.warnings.diploma', { diplomas }));
    }
    if (warnings['study-scheme']) {
      const studySchemes = uniq(warnings['study-scheme'].map((warning) => warning.value)).join(', ');
      warningMessages.push(this.intl.t('pages.students-sup-import.warnings.study-scheme', { studySchemes }));
    }
    return this.notifications.sendWarning(this.intl.t(
      'pages.students-sup-import.global-success-with-warnings',
      { warnings: warningMessages.join(''), htmlSafe: true },
    ));
  }

  _sendErrorNotifications(errorResponse) {
    const globalErrorMessage = this.intl.t('pages.students-sup-import.global-error', { htmlSafe: true });
    if (errorResponse.body.errors) {
      errorResponse.body.errors.forEach((error) => {
        if (error.status === '412' || error.status === '413') {
          const message = this.errorMessages.getErrorMessage(error.code, error.meta) || error.detail;
          return this.notifications.sendError(this.intl.t('pages.students-sup-import.error-wrapper', { message, htmlSafe: true }));
        }
        return this.notifications.sendError(globalErrorMessage, { onClick: () => window.open(this.intl.t('common.help-form'), '_blank') });
      });
    } else {
      return this.notifications.sendError(globalErrorMessage, { onClick: () => window.open(this.intl.t('common.help-form'), '_blank') });
    }
  }
}
