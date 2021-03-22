import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import _get from 'lodash/get';

function _pad(num, size) {
  let s = num + '';
  while (s.length < size) s = '0' + s;
  return s;
}

function _isMatchingReconciledStudentNotFoundError(err) {
  return _get(err, 'errors[0].code') === 'MATCHING_RECONCILED_STUDENT_NOT_FOUND';
}

export default class CertificationJoiner extends Component {
  @service store;
  @service peeker;
  @service currentUser;
  @service intl;

  SESSION_ID_VALIDATION_PATTERN = '^[0-9]*$';

  @tracked isLoading = false;
  @tracked errorMessage = null;
  @tracked sessionIdIsNotANumberError = null;
  @tracked validationClassName = '';
  @tracked showCongratulationsBanner = true;
  @tracked sessionId = null;
  @tracked firstName = null;
  @tracked lastName = null;
  @tracked dayOfBirth = null;
  @tracked monthOfBirth = null;
  @tracked yearOfBirth = null;

  get birthdate() {
    const monthOfBirth = _pad(this.monthOfBirth, 2);
    const dayOfBirth = _pad(this.dayOfBirth, 2);
    return [this.yearOfBirth, monthOfBirth, dayOfBirth].join('-');
  }

  createCertificationCandidate() {
    const { firstName, lastName, birthdate, sessionId } = this;

    return this.store.createRecord('certification-candidate', {
      sessionId,
      birthdate,
      firstName: firstName
        ? firstName.trim()
        : null,
      lastName: lastName
        ? lastName.trim()
        : null,
    });
  }

  @action
  closeBanner() {
    this.showCongratulationsBanner = false;
  }

  _isANumber(value) {
    return new RegExp(this.SESSION_ID_VALIDATION_PATTERN).test(value);
  }

  @action
  checkSessionIdIsValid(event) {
    const { value } = event.target;
    if (value && !this._isANumber(value)) {
      this.sessionIdIsNotANumberError = this.intl.t('pages.certification-joiner.form.fields-validation.session-number-error');
    } else {
      this.sessionIdIsNotANumberError = null;
    }
  }

  @action
  async attemptNext(e) {
    e.preventDefault();
    this.args.stepsData.joiner = { sessionId: this.sessionId };
    let currentCertificationCandidate = null;
    if (this.sessionId && !this._isANumber(this.sessionId)) {
      this.sessionIdIsNotANumberError = this.intl.t('pages.certification-joiner.form.fields-validation.session-number-error');
      document.querySelector('#certificationJoinerSessionId').focus();
      return;
    }
    try {
      this.isLoading = true;
      currentCertificationCandidate = this.createCertificationCandidate();
      await currentCertificationCandidate.save({ adapterOptions: { joinSession: true, sessionId: this.sessionId } });
      this.args.success();
    } catch (err) {
      if (currentCertificationCandidate) {
        currentCertificationCandidate.deleteRecord();
      }
      this.isLoading = false;

      if (_isMatchingReconciledStudentNotFoundError(err)) {
        this.errorMessage = 'Oups ! Il semble que vous n’utilisiez pas le bon compte Pix pour rejoindre cette session de certification.\nPour continuer, connectez-vous au bon compte Pix ou demandez de l’aide au surveillant.';
      } else {
        this.errorMessage = 'Oups ! Nous ne parvenons pas à vous trouver.\nVérifiez vos informations afin de continuer ou prévenez le surveillant.';
      }
    }
  }

  @action
  handleDayInputChange(event) {
    const { value } = event.target;

    if (value.length === 2) {
      document.getElementById('certificationJoinerMonthOfBirth').focus();
    }
  }

  @action
  handleMonthInputChange(event) {
    const { value } = event.target;

    if (value.length === 2) {
      document.getElementById('certificationJoinerYearOfBirth').focus();
    }
  }

  @action
  handleInputFocus(value, event) {
    event.target.select();
  }
}
