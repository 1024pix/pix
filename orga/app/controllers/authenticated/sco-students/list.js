import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { CONNECTION_TYPES } from '../../../models/student';
import ENV from 'pix-orga/config/environment';

export default class ListController extends Controller {
  @service currentUser;
  @service notifications;
  @service intl;
  @service errorMessages;
  @service store;

  @tracked isLoading = false;
  @tracked lastName = null;
  @tracked firstName = null;
  @tracked divisions = [];
  @tracked connexionType = null;
  @tracked pageNumber = null;
  @tracked pageSize = null;

  @action
  triggerFiltering(fieldName, value) {
    this[fieldName] = value;
    this.pageNumber = null;
  }

  get connectionTypesOptions() {
    return [
      { value: 'none', label: this.intl.t(CONNECTION_TYPES.none) },
      { value: 'email', label: this.intl.t(CONNECTION_TYPES.email) },
      { value: 'identifiant', label: this.intl.t(CONNECTION_TYPES.identifiant) },
      { value: 'mediacentre', label: this.intl.t(CONNECTION_TYPES.mediacentre) },
    ];
  }

  @action
  async importStudents(files) {
    const adapter = this.store.adapterFor('students-import');
    const organizationId = this.currentUser.organization.id;
    const acceptedFormatName = this.currentUser.isAgriculture ? 'csv' : 'xml';

    // Fregata sets `text/plain` mime type on csv files
    // They know about it and we are waiting for the patch
    // Until then we have to accept the `text/plain` mime type for csv files
    const acceptedFormatMimeTypes = this.currentUser.isAgriculture ? ['text/plain', 'csv'] : ['xml'];

    this.isLoading = true;
    this.notifications.clearAll();
    try {
      await adapter.importStudentsSiecle(organizationId, files, acceptedFormatName, acceptedFormatMimeTypes);
      this.refresh();
      this.isLoading = false;
      this.notifications.sendSuccess(this.intl.t('pages.students-sco.import.global-success'));
    } catch (errorResponse) {
      this.isLoading = false;
      this._handleError(errorResponse, acceptedFormatName);
    }
  }

  _handleError(errorResponse, acceptedFormatName) {
    if (errorResponse.message === ENV.APP.ERRORS.FILE_UPLOAD.FORMAT_NOT_SUPPORTED_ERROR) {
      return this.notifications.sendError(
        this.intl.t('pages.students-sco.import.invalid-mimetype', { format: acceptedFormatName, htmlSafe: true })
      );
    }

    const globalErrorMessage = this.intl.t('pages.students-sco.import.global-error', { htmlSafe: true });
    if (!errorResponse.errors) {
      return this.notifications.sendError(globalErrorMessage, {
        onClick: () => window.open(this.intl.t('common.help-form'), '_blank'),
      });
    }

    errorResponse.errors.forEach((error) => {
      if (['422', '412', '413'].includes(error.status)) {
        const message = this.errorMessages.getErrorMessage(error.code, error.meta) || error.detail;
        return this.notifications.sendError(
          this.intl.t('pages.students-sco.import.error-wrapper', { message, htmlSafe: true })
        );
      }
      return this.notifications.sendError(globalErrorMessage, {
        onClick: () => window.open(this.intl.t('common.help-form'), '_blank'),
      });
    });
  }

  @action
  refresh() {
    this.send('refreshModel');
  }
}
