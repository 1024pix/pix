import Component from '@ember/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import classic from 'ember-classic-decorator';

function _pad(num, size) {
  let s = num + '';
  while (s.length < size) s = '0' + s;
  return s;
}

@classic
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

  success() {}

  didInsertElement() {
    super.didInsertElement(...arguments);
    if (this.getCurrentCandidate()) {
      this.success();
    }
  }

  joinCertificationSession() {
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
    }).save({ adapterOptions: { joinSession: true, sessionId } });
  }

  getCurrentCandidate() {
    return this.peeker.findOne('certification-candidate');
  }

  @action
  closeBanner() {
    this.showCongratulationsBanner = false;
  }

  @action
  async attemptNext() {
    this.stepsData.joiner = { sessionId: this.sessionId };
    this.isLoading = true;
    try {
      await this.joinCertificationSession();
      this.success();
    } catch (err) {
      const currentCandidate = this.getCurrentCandidate();
      if (currentCandidate) {
        currentCandidate.deleteRecord();
      }
      this.isLoading = false;
      this.errorMessage = 'Oups ! Nous ne parvenons pas à vous trouver.\nVérifiez vos informations afin de continuer ou prévenez le surveillant.';
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
