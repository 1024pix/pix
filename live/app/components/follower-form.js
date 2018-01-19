import { computed } from '@ember/object';
import { equal, or } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { later } from '@ember/runloop';
import config from 'pix-live/config/environment';
import isEmailValid from 'pix-live/utils/email-validator';

function hideMessageDiv(context) {
  later(function() {
    context.set('status', 'empty');
    context.set('errorType', 'invalid');
  }, config.APP.MESSAGE_DISPLAY_DURATION);
}

function getErrorType(errors) {
  const statusCode = parseInt(errors[0].status);
  return (statusCode === 409) ? 'exist' : 'invalid';
}

export default Component.extend({

  store: service(),

  classNames: ['follower-form'],

  _followerEmail: null,
  errorType: 'invalid', // invalid | exist
  status: 'empty', // empty | pending | success | error

  messages: {
    error: {
      invalid: 'Votre adresse n\'est pas valide',
      exist: 'L\'e-mail choisi est déjà utilisé'
    },
    success: 'Merci pour votre inscription'
  },

  hasError: equal('status', 'error'),
  isPending: equal('status', 'pending'),
  hasSuccess: equal('status', 'success'),
  hasMessage: or('hasError', 'hasSuccess'),

  messageClassName: computed('status', function() {
    return (this.get('status') === 'error') ? 'has-error' : 'has-success';
  }),

  infoMessage: computed('hasError', function() {
    const currentErrorType = this.get('errorType');
    return (this.get('hasError')) ? this.get('messages.error')[currentErrorType] : this.get('messages.success');
  }),

  submitButtonText: computed('status', function() {
    return (this.get('status') === 'pending') ? 'envoi en cours' : 's\'inscrire';
  }),

  actions: {
    submit() {
      this.set('status', 'pending');
      const email = (this.get('_followerEmail')) ? this.get('_followerEmail').trim() : '';
      if (!isEmailValid(email)) {
        this.set('status', 'error');
        hideMessageDiv(this);
        return;
      }

      const store = this.get('store');
      const follower = store.createRecord('follower', { email });
      follower.save()
        .then(() => {
          this.set('status', 'success');
          hideMessageDiv(this);
          this.set('_followerEmail', null);
        })
        .catch(({ errors }) => {
          this.set('errorType', getErrorType(errors));
          this.set('status', 'error');
          hideMessageDiv(this);
        });
    }
  }
});
