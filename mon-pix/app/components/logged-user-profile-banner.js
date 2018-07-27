import $ from 'jquery';
import Component from '@ember/component';
import config from 'mon-pix/config/environment';

export default Component.extend({
  classNames: ['logged-user-profile-banner'],

  actions: {
    scrollToProfile() {
      $('html, body').animate({
        scrollTop: $('.profile-panel__header').offset().top - 15
      }, config.APP.SCROLL_DURATION);
    }
  }
});
