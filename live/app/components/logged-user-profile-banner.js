import Ember from 'ember';
import config from 'pix-live/config/environment';

export default Ember.Component.extend({
  classNames: ['logged-user-profile-banner'],

  actions: {
    scrollToProfile() {
      Ember.$('body').animate({
        scrollTop: Ember.$('.profile-panel__header').offset().top - 15
      }, config.APP.SCROLL_DURATION);
    }
  }
});
