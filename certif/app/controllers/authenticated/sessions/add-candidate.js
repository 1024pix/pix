import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import get from 'lodash/get';
import toNumber from 'lodash/toNumber';

const TRANSLATE_PREFIX = 'pages.sessions.detail.candidates';

export default class AddCandidateController extends Controller {
  @service intl;
  @service pixToast;
  @service store;

  @action
  async addCertificationCandidate(candidate) {
    const certificationCandidate = { ...candidate };
    certificationCandidate.extraTimePercentage = this._fromPercentageStringToDecimal(candidate.extraTimePercentage);

    return this._saveCertificationCandidate(certificationCandidate);
  }

  async _saveCertificationCandidate(certificationCandidateData) {
    const certificationCandidate = this._createCertificationCandidateRecord(certificationCandidateData);

    if (this._hasDuplicate(certificationCandidate)) {
      this._handleDuplicateError(certificationCandidate);
      return false;
    }

    try {
      await certificationCandidate.save({
        adapterOptions: { registerToSession: true, sessionId: this.model.session.id },
      });
      this.pixToast.sendSuccessNotification({
        message: this.intl.t(`${TRANSLATE_PREFIX}.add-form.notifications.success-add`),
      });
      return true;
    } catch (errorResponse) {
      const status = get(errorResponse, 'errors[0].status');

      const errorText = this._getErrorText({ status, errorResponse });
      this._handleSavingError({ errorText, certificationCandidate });
      return false;
    }
  }

  _createCertificationCandidateRecord(certificationCandidateData) {
    if (!certificationCandidateData.subscription) {
      certificationCandidateData.subscription = 'CORE';
    }
    return this.store.createRecord('certification-candidate', certificationCandidateData);
  }

  _getErrorText({ status, errorResponse }) {
    switch (status) {
      case '409':
        return this.intl.t(`${TRANSLATE_PREFIX}.add-form.notifications.error-add-duplicate`);
      case '422':
        return this._handleEntityValidationError(errorResponse);
      case '400':
        return this._handleMissingQueryParamError(errorResponse);
      case '412':
      case '403':
        return this._handleApiError(errorResponse);
      default:
        return this.intl.t(`${TRANSLATE_PREFIX}.add-form.notifications.error-add-unknown`);
    }
  }

  _handleEntityValidationError(errorResponse) {
    const error = errorResponse?.errors?.[0];
    if (error?.code) {
      return this.intl.t(`common.api-error-messages.certification-candidate.${error.code}`, {
        ...error?.meta,
      });
    }
  }

  _handleApiError(errorResponse) {
    const error = errorResponse?.errors?.[0];
    if (error?.code) {
      return this.intl.t(`common.api-error-messages.${error.code}`, {
        ...error?.meta,
      });
    }
  }

  _handleMissingQueryParamError(errorResponse) {
    const error = errorResponse?.errors?.[0];
    if (error?.detail === 'CANDIDATE_BIRTHDATE_FORMAT_NOT_VALID') {
      return this.intl.t(`common.api-error-messages.certification-candidate.${error.detail}`);
    }
  }

  _handleSavingError({ errorText, certificationCandidate }) {
    const error = errorText ?? this.intl.t(`common.api-error-messages.internal-server-error`);
    this.pixToast.sendErrorNotification({ message: error });
    certificationCandidate.deleteRecord();
  }

  _handleDuplicateError(certificationCandidate) {
    const errorText = this.intl.t(`${TRANSLATE_PREFIX}.add-form.notifications.error-add-duplicate`);
    this._handleSavingError({ errorText, certificationCandidate });
  }

  _fromPercentageStringToDecimal(value) {
    return value ? toNumber(value) / 100 : value;
  }

  _hasDuplicate(certificationCandidate) {
    const currentFirstName = certificationCandidate.firstName;
    const currentLastName = certificationCandidate.lastName;
    const currentBirthdate = certificationCandidate.birthdate;

    return (
      this.model.certificationCandidates.find(
        ({ lastName, firstName, birthdate }) =>
          lastName.toLowerCase() === currentLastName.toLowerCase() &&
          firstName.toLowerCase() === currentFirstName.toLowerCase() &&
          birthdate === currentBirthdate,
      ) !== undefined
    );
  }
}
