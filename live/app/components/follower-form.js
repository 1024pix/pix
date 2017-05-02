import Ember from 'ember';
import config from 'pix-live/config/environment';
import isEmailValid from 'pix-live/utils/email-validator';

function hideMessageDiv(context) {
  Ember.run.later(function () {
    context.set('status', 'empty');
    context.set('errorType', 'invalid');
  }, config.APP.MESSAGE_DISPLAY_DURATION);
}

function getErrorType(errors) {
  const statusCode = parseInt(errors[0].status);
  return (statusCode === 409) ? 'exist' : 'invalid';
}

export default Ember.Component.extend({

  store: Ember.inject.service(),

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

  hasError: Ember.computed.equal('status', 'error'),
  isPending: Ember.computed.equal('status', 'pending'),
  hasSuccess: Ember.computed.equal('status', 'success'),
  hasMessage: Ember.computed.or('hasError', 'hasSuccess'),

  messageClassName: Ember.computed('status', function () {
    return (this.get('status') === 'error') ? 'has-error' : 'has-success';
  }),

  infoMessage: Ember.computed('hasError', function () {
    const currentErrorType = this.get('errorType');
    return (this.get('hasError')) ? this.get('messages.error')[currentErrorType] : this.get('messages.success');
  }),

  submitButtonText: Ember.computed('status', function () {
    return (this.get('status') === 'pending') ? 'envoi en cours' : 's\'inscrire';
  }),

  actions: {
    submit(){
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
