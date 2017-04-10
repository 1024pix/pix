import Ember from 'ember';
import ENV from 'pix-live/config/environment';
import isEmailValid from 'pix-live/utils/email-validator';

const messageDisplayDuration = 1500;

function hideMessageDiv(context) {
  if (ENV.environment !== 'test') {
    Ember.run.later(function () {
      context.set('status', 'empty');
      context.set('errorType', 'invalid');
    }, messageDisplayDuration);
  }
}

function getErrorType(errors) {
  const statusCode = parseInt(errors[0].status);
  return (statusCode === 409) ? 'exist' : 'invalid';
}

export default Ember.Component.extend({

  classNames: ['follower-form'],

  store: Ember.inject.service(),
  errorType:'invalid' ,
  status: 'empty', // empty | pending | success | error

  messages: {
    error : {
      invalid: 'Votre adresse n\'est pas valide',
      exist: 'L\'e-mail choisi est déjà utilisé'
    },
    success: 'Merci pour votre inscription'
  },

  hasError: Ember.computed('status', function () {
    return this.get('status') === 'error';
  }),

  isPending: Ember.computed('status', function () {
    return this.get('status') === 'pending';
  }),

  hasSuccess: Ember.computed('status', function () {
    return this.get('status') === 'success';
  }),

  hasMessage: Ember.computed('hasError', 'hasSuccess', function () {
    return this.get('hasError') || this.get('hasSuccess');
  }),

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
      const email = (this.get('followerEmail'))? this.get('followerEmail').trim() : '';
      if (!isEmailValid(email)) {
        this.set('status', 'error');
        hideMessageDiv(this);
        return;
      }

      const store = this.get('store');
      const follower = store.createRecord('follower', {email: email});
      follower.save()
        .then(() => {
          this.set('status', 'success');
          hideMessageDiv(this);
          this.set('followerEmail', null);
        })
        .catch(({errors}) => {
          this.set('errorType', getErrorType(errors));
          this.set('status', 'error');
          hideMessageDiv(this);
        });
    }
  }
});
