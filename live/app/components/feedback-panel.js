import Ember from 'ember';
import isValid from '../utils/email-validator';

const FORM_CLOSED = 'FORM_CLOSED';
const FORM_OPENED= 'FORM_OPENED';
const FORM_SUBMITTED = 'FORM_SUBMITTED';

export default Ember.Component.extend({

  store: Ember.inject.service(),

  classNames: ['feedback-panel'],

  assessment: null,
  challenge: null,

  _status: FORM_CLOSED,
  _email: null,
  _content: null,
  _error: null,

  isFormClosed: Ember.computed.equal('_status', FORM_CLOSED),
  isFormOpened: Ember.computed.equal('_status', FORM_OPENED),

  didUpdateAttrs() {
    this._super(...arguments);
    this.reset();
  },

  reset() {
    this.set('_status', FORM_CLOSED);
    this.set('_email', null);
    this.set('_content', null);
    this.set('_error', null);
  },

  actions: {

    openFeedbackForm() {
      this.set('_status', FORM_OPENED);
    },

    sendFeedback() {
      const email = this.get('_email');
      if (!Ember.isEmpty(email) && !isValid(email)) {
        this.set('_error', 'Vous devez saisir une adresse mail valide.');
        return;
      }

      if (Ember.isEmpty(this.get('_content').trim())) {
        this.set('_error', 'Vous devez saisir un message.');
        return;
      }

      const store = this.get('store');
      const assessment = this.get('assessment');
      const challenge = this.get('challenge');

      const feedback = store.createRecord('feedback', {
        email: this.get('_email'),
        content: this.get('_content'),
        assessment,
        challenge
      });

      feedback.save().then(() => this.set('_status', FORM_SUBMITTED));
    },

    cancelFeedback() {
      this.reset();
    }
  }
});
