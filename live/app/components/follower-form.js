import Ember from 'ember';
const messageDisplayDuration = 1500;

function hideMessageDiv(context) {
  Ember.run.later(function () {
    context.set('status', 'empty');
  }, messageDisplayDuration);
}
export default Ember.Component.extend({
  emailValidator: Ember.inject.service('email-validator'),
  store: Ember.inject.service(),
  status: 'empty', // empty | pending | success | error
  messages: {
    error: 'Votre adresse n\'est pas valide',
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
    return (this.get('hasError')) ? this.get('messages.error') : this.get('messages.success');
  }),

  submitButtonText: Ember.computed('status', function () {
    return (this.get('status') === 'pending') ? 'envoi en cours' : 's\'inscrire';
  }),

  _checkEmail(email){
    if (!this.get('emailValidator').emailIsValid(email)) {
      return false;
    }
    return true;
  },

  actions: {
    submit(){
      this.set('status', 'pending');
      const email = (this.get('followerEmail'))? this.get('followerEmail').trim() : '';
      if (!this._checkEmail(email) || email.length<1) {
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
        .catch(() => {
          this.set('status', 'error');
          hideMessageDiv(this);
        });
    }
  }
});
