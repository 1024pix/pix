import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import delay from 'lodash/delay';
import ENV from 'pix-certif/config/environment';

export default class ImportController extends Controller {
  @service fileSaver;
  @service session;
  @service featureToggles;
  @service notifications;
  @service intl;
  @service currentUser;
  @service store;
  @service router;

  @tracked file = null;
  @tracked isImportDisabled = true;
  @tracked isImportStepOne = true;
  @tracked sessionsReport;

  @tracked sessionsCount;
  @tracked sessionsWithoutCandidatesCount;
  @tracked candidatesCount;

  @tracked errorReports;
  @tracked importErrorMessage = null;
  @tracked isImportInError = false;
  @tracked isLoading = false;

  get filename() {
    return this.file.name;
  }

  @action
  async downloadSessionImportTemplate() {
    const certificationCenterId = this.currentUser.currentAllowedCertificationCenterAccess.id;
    const url = `/api/certification-centers/${certificationCenterId}/import`;
    const token = this.session.data.authenticated.access_token;
    try {
      await this.fileSaver.save({ url, token });
    } catch (error) {
      if (error[0]?.code === 403) {
        this.importErrorMessage = this.intl.t('pages.sessions.import.step-one.errors.forbidden');
        return;
      }
      this.importErrorMessage = this.intl.t('pages.sessions.import.step-one.errors.download');
    }
  }

  @action
  preImportSessions() {
    this.file = document.getElementById('file-upload').files[0];
    this.isImportDisabled = false;
    this.importErrorMessage = null;
  }

  @action
  async validateSessions(isValidationInStepOne) {
    const adapter = this.store.adapterFor('validate-sessions-for-mass-import');
    const certificationCenterId = this.currentUser.currentAllowedCertificationCenterAccess.id;
    this.notifications.clearAll();
    this.isImportDisabled = true;
    try {
      if (!this.file) {
        return;
      }
      const {
        sessionsCount,
        sessionsWithoutCandidatesCount,
        candidatesCount,
        cachedValidatedSessionsKey,
        errorReports,
      } = await adapter.validateSessionsForMassImport(this.file, certificationCenterId);
      this.sessionsCount = sessionsCount;
      this.sessionsWithoutCandidatesCount = sessionsWithoutCandidatesCount;
      this.candidatesCount = candidatesCount;
      this.cachedValidatedSessionsKey = cachedValidatedSessionsKey;
      this.errorReports = errorReports;
    } catch (responseError) {
      if (responseError.errors[0].code === 403) {
        this.importErrorMessage = this.intl.t('pages.sessions.import.step-one.errors.forbidden');
        return;
      }
      this.importErrorMessage = this.intl.t(this._handleApiError(responseError));
      return;
    }

    if (isValidationInStepOne) {
      this.isImportStepOne = false;
    } else {
      this.isLoading = true;
      delay(() => (this.isLoading = false), 1000);
    }
    this.removeImport();
  }
  @action
  async createSessions() {
    const sessionMassImportReport = this.store.createRecord('sessions-mass-import-report', {
      cachedValidatedSessionsKey: this.cachedValidatedSessionsKey,
    });
    try {
      await sessionMassImportReport.confirm({ cachedValidatedSessionsKey: this.cachedValidatedSessionsKey });
      this.notifications.success(
        this.intl.t('pages.sessions.import.success', {
          sessionsCount: this.sessionsCount,
          sessionsWithoutCandidatesCount: this.sessionsWithoutCandidatesCount,
          candidatesCount: this.candidatesCount,
        }),
      );
    } catch (error) {
      this.isImportStepOne = true;
      this.notifications.error(this.intl.t('common.api-error-messages.internal-server-error'));
    }
    this.router.transitionTo('authenticated.sessions.list');
  }

  @action
  removeImport() {
    this.file = null;
    this.isImportDisabled = true;
    this.importErrorMessage = null;
  }

  reset() {
    this.isImportStepOne = true;
  }

  _handleApiError(responseError) {
    const errorCodes = ['CSV_HEADERS_NOT_VALID', 'CSV_DATA_REQUIRED'];
    const error = responseError?.errors[0];
    return errorCodes.includes(error.code)
      ? `pages.sessions.import.step-one.errors.${error.code}`
      : ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.I18N_KEY;
  }
}
