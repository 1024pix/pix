import { isEmpty } from '@ember/utils';
import $ from 'jquery';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import config from 'mon-pix/config/environment';

export default Component.extend({

  classNames: ['feedback-panel'],

  store: service(),

  assessment: null,
  challenge: null,

  isFormOpened: false,

  _content: null,
  _error: null,
  _isSubmitted: false,

  _scrollToPanel: function() {
    $('html,body').animate({
      scrollTop: $('.feedback-panel__view').offset().top - 15
    }, config.APP.SCROLL_DURATION);
  },

  _resetPanel: function() {
    this.set('_isSubmitted', false);
    this.set('_error', null);
  },

  didReceiveAttrs: function() {
    this._super();
    this._resetPanel();
    this.set('_content', null);
  },

  actions: {

    toggleFeedbackForm() {
      if (this.isFormOpened) {
        this.set('isFormOpened', false);
        this._resetPanel();
      } else {
        this.set('isFormOpened', true);
        this._scrollToPanel();
      }
    },

    async sendFeedback() {
      const content = this._content;

      if (isEmpty(content) || isEmpty(content.trim())) {
        this.set('_error', 'Vous devez saisir un message.');
        return;
      }

      const feedback = this.store.createRecord('feedback', {
        content,
        assessment: this.assessment,
        challenge: this.challenge,
      });

      await feedback.save();

      this.set('_content', null);
      this.set('_isSubmitted', true);
    }
  }
});
