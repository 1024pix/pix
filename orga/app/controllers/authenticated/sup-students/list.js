import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import ENV from 'pix-orga/config/environment';
import debounce from 'lodash/debounce';

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
      await file.uploadBinary(`${ENV.APP.API_HOST}/api/organizations/${this.currentUser.organization.id}/schooling-registrations/import-csv`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Accept-Language': this.currentUser.prescriber.lang,
        },
      });

      this.refresh();
      this.isLoading = false;
      this.notifications.sendSuccess(this.intl.t('pages.students-sup.import.global-success'));

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

  @action
  refresh() {
    this.send('refreshModel');
  }
}
