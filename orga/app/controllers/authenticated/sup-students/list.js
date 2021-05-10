import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import ENV from 'pix-orga/config/environment';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';
import uniq from 'lodash/uniq';
import get from 'lodash/get';
import groupBy from 'lodash/groupBy';

export default class ListController extends Controller {
  @service session;
  @service currentUser;
  @service notifications;
  @service errorMessages;
  @service intl;

  @tracked isLoading = false;

  @tracked lastName = null;
  @tracked firstName = null;
  @tracked studentNumber = null;
  @tracked pageNumber = null;
  @tracked pageSize = null;

  updateFilters(filters) {
    Object.keys(filters).forEach((filterKey) => this[filterKey] = filters[filterKey]);
    this.pageNumber = null;
  }

  debouncedUpdateFilters = debounce(this.updateFilters, ENV.pagination.debounce);

  @action
  triggerFiltering(fieldName, debounced, event) {
    if (debounced) {
      this.debouncedUpdateFilters({ [fieldName]: event.target.value });
    } else {
      this.updateFilters({ [fieldName]: event.target.value });
    }
  }

  @action
  async importStudents(file) {
    this.isLoading = true;
    this.notifications.clearAll();
    const { access_token } = this.session.data.authenticated;

    try {
      const response = await file.uploadBinary(`${ENV.APP.API_HOST}/api/organizations/${this.currentUser.organization.id}/schooling-registrations/import-csv`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Accept-Language': this.currentUser.prescriber.lang,
        },
      });

      this.refresh();
      this.isLoading = false;

      this._sendNotifications(response);

    } catch (errorResponse) {
      this.isLoading = false;

      const globalErrorMessage = this.intl.t('pages.students-sup.import.global-error', { htmlSafe: true });
      if (errorResponse.body.errors) {
        errorResponse.body.errors.forEach((error) => {
          if (error.status === '412' || error.status === '413') {
            const message = this.errorMessages.getErrorMessage(error.code, error.meta) || error.detail;
            return this.notifications.sendError(this.intl.t('pages.students-sup.import.error-wrapper', { message, htmlSafe: true }));
          }
          return this.notifications.sendError(globalErrorMessage, { onClick: () => window.open(this.intl.t('common.help-form'), '_blank') });
        });
      } else {
        return this.notifications.sendError(globalErrorMessage, { onClick: () => window.open(this.intl.t('common.help-form'), '_blank') });
      }
    }
  }

  _sendNotifications(response) {
    const warningsArray = get(response, 'body.data.attributes.warnings', []);

    if (isEmpty(warningsArray)) {
      return this.notifications.sendSuccess(this.intl.t('pages.students-sup.import.global-success'));
    }

    const warnings = groupBy(warningsArray, 'field');
    const warningMessages = [];
    if (warnings.diploma) {
      const diplomas = uniq(warnings.diploma.map((warning) => warning.value)).join(', ');
      warningMessages.push(this.intl.t('pages.students-sup.import.warnings.diploma', { diplomas }));
    }
    if (warnings['study-scheme']) {
      const studySchemes = uniq(warnings['study-scheme'].map((warning) => warning.value)).join(', ');
      warningMessages.push(this.intl.t('pages.students-sup.import.warnings.study-scheme', { studySchemes }));
    }
    return this.notifications.sendWarning(this.intl.t(
      'pages.students-sup.import.global-success-with-warnings',
      { warnings: warningMessages.join(''), htmlSafe: true },
    ));
  }

  @action
  refresh() {
    this.send('refreshModel');
  }
}
