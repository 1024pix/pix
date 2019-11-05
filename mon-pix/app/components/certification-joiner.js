import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

function _pad(num, size) {
  let s = num + '';
  while (s.length < size) s = '0' + s;
  return s;
}

export default Component.extend({
  store: service(),
  peeker: service(),
  currentUser: service(),

  isLoading: false,
  errorMessage: null,
  showCongratulationsBanner: true,
  sessionId: null,
  firstName: null,
  lastName: null,
  dayOfBirth: null,
  monthOfBirth: null,
  yearOfBirth: null,

  birthdate: computed('yearOfBirth', 'monthOfBirth', 'dayOfBirth', function() {
    const monthOfBirth = _pad(this.monthOfBirth, 2);
    const dayOfBirth = _pad(this.dayOfBirth, 2);
    return [this.yearOfBirth, monthOfBirth, dayOfBirth].join('-');
  }),

  success() {},

  didInsertElement() {
    this._super(...arguments);
    if (this.getCurrentCandidate()) {
      this.success();
    }
  },

  joinCertificationSession() {
    const { firstName, lastName, birthdate, sessionId } = this;
    return this.store
      .createRecord('certification-candidate', { firstName, lastName, birthdate, sessionId })
      .save({ adapterOptions: { joinSession: true, sessionId } });
  },

  getCurrentCandidate() {
    return this.peeker.findOne('certification-candidate');
  },

  actions: {
    closeBanner() {
      this.set('showCongratulationsBanner', false);
    },

    async attemptNext() {
      this.set('isLoading', true);
      try {
        await this.joinCertificationSession();
        this.success();
      } catch (err) {
        this.getCurrentCandidate().deleteRecord();
        this.set('isLoading', false);
        this.set('errorMessage',
          'Oups ! Nous ne parvenons pas à vous trouver.\nVérifiez vos informations afin de continuer ou prévenez le surveillant.');
      }
    }
  },
});
