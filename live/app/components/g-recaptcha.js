import Ember from 'ember';

export default Ember.Component.extend({

  classNames: ['gg-recaptcha'],

  googleRecaptcha: Ember.inject.service(),

  validateRecaptcha: null, // action
  resetRecaptcha: null, // action

  tokenHasBeenUsed: null,
  validation: null,

  didInsertElement() {
    this._super(...arguments);
    const component = this;
    this.get('googleRecaptcha').loadScript().then(function() {
      component.renderRecaptcha();
    });
  },

  didUpdateAttrs() {
    this._super(...arguments);
    if(this.get('tokenHasBeenUsed')) {
      this.get('googleRecaptcha').reset();
    }
  },

  renderRecaptcha() {
    const callback = this.get('validateCallback').bind(this);
    const expiredCallback = this.get('expiredCallback').bind(this);
    this.get('googleRecaptcha').render('g-recaptcha-container', callback, expiredCallback);
  },

  validateCallback(recaptchaResponse) {
    this.set('recaptchaToken', recaptchaResponse);
    this.set('tokenHasBeenUsed', false);
  },

  expiredCallback() {
    this.set('recaptchaToken', null);
    this.set('tokenHasBeenUsed', false);
  }

});
