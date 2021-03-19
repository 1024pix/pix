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

function _isAValidSessionId(value) {
  const isANumberRegex = new RegExp('^[0-9]*$');
  return isANumberRegex.test(value);
}

export default class CertificationJoiner extends Component {
  @service store;
  @service peeker;
  @service currentUser;

  @tracked isLoading = false;
  @tracked errorMessage = null;
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

  @action
  async attemptNext(e) {
    e.preventDefault();
    this.args.stepsData.joiner = { sessionId: this.sessionId };
    let currentCertificationCandidate = null;
    try {
      if (this.sessionId && !_isAValidSessionId(this.sessionId)) {
        this.errorMessage = 'Merci de saisir le numéro de session, composé uniquement de chiffres.';
        return;
      }

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
