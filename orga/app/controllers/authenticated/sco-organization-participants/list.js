import { action } from '@ember/object';
import { service } from '@ember/service';
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class ListController extends Controller {
  @service currentUser;
  @service notifications;
  @service intl;
  @service errorMessages;
  @service store;
  @service router;

  @tracked isLoading = false;

  @tracked search = null;
  @tracked divisions = [];
  @tracked connectionTypes = [];
  @tracked certificability = [];
  @tracked pageNumber = null;
  @tracked pageSize = 50;
  @tracked participationCountOrder = null;
  @tracked lastnameSort = 'asc';
  @tracked divisionSort = null;

  get hasComputeOrganizationLearnerCertificabilityEnabled() {
    return this.currentUser.prescriber.computeOrganizationLearnerCertificability;
  }

  @action
  goToLearnerPage(learnerId, event) {
    event.preventDefault();
    this.router.transitionTo('authenticated.sco-organization-participants.sco-organization-participant', learnerId);
  }

  @action
  sortByParticipationCount(value) {
    this.participationCountOrder = value;
    this.divisionSort = null;
    this.pageNumber = null;
    this.lastnameSort = null;
  }

  @action
  sortByLastname(value) {
    this.lastnameSort = value;
    this.divisionSort = null;
    this.participationCountOrder = null;
    this.pageNumber = null;
  }

  @action
  sortByDivision(value) {
    this.divisionSort = value;
    this.participationCountOrder = null;
    this.lastnameSort = null;
    this.pageNumber = null;
  }

  @action
  triggerFiltering(fieldName, value) {
    this[fieldName] = value || undefined;
    this.pageNumber = null;
  }

  @action
  resetFiltering() {
    this.pageNumber = null;
    this.divisions = [];
    this.connectionTypes = [];
    this.search = null;
    this.certificability = [];
  }

  @action
  async importStudents(files) {
    const adapter = this.store.adapterFor('students-import');
    const organizationId = this.currentUser.organization.id;
    const format = this.currentUser.isAgriculture ? 'csv' : 'xml';
    const confirmBeforeClose = (event) => {
      event.preventDefault();
      return (event.returnValue = '');
    };
    window.addEventListener('beforeunload', confirmBeforeClose);
    this.isLoading = true;
    this.notifications.clearAll();
    try {
      await adapter.importStudentsSiecle(organizationId, files, format);
      this.refresh();
      this.isLoading = false;
      this.notifications.sendSuccess(this.intl.t('pages.sco-organization-participants.import.global-success'));
    } catch (errorResponse) {
      this.isLoading = false;
      this._handleError(errorResponse);
    }
    window.removeEventListener('beforeunload', confirmBeforeClose);
  }

  _handleError(errorResponse) {
    const globalErrorMessage = this.intl.t('pages.sco-organization-participants.import.global-error', {
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
          this.intl.t('pages.sco-organization-participants.import.error-wrapper', { message, htmlSafe: true }),
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
