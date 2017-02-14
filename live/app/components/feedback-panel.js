import Ember from 'ember';
import isValid from '../utils/email-validator';

const FORM_CLOSED = 'FORM_CLOSED';
const FORM_OPENED= 'FORM_OPENED';
const FORM_SUBMITTED = 'FORM_SUBMITTED';

const FeedbackPanel = Ember.Component.extend({

  store: Ember.inject.service(),

  email: '',
  content: '',
  error: null,
  status: FORM_CLOSED,
  isFormClosed: Ember.computed.equal('status', FORM_CLOSED),
  isFormOpened: Ember.computed.equal('status', FORM_OPENED),

  actions: {
    openFeedbackForm() {
      this.set('status', FORM_OPENED);
    },

    sendFeedback() {
      if (!Ember.isEmpty(this.get('email')) && !isValid(this.get('email'))) {
        this.set('error', 'Vous devez saisir une adresse mail valide.');
        return;
      }

      if (Ember.isEmpty(this.get('content').trim())) {
        this.set('error', 'Vous devez saisir un message.');
        return;
      }

      const store = this.get('store');
      const answer = this.get('answer');

      const feedback = store.createRecord('feedback', {
        email: this.get('email'),
        content: this.get('content'),
        assessment: answer.get('assessment'),
        challenge: answer.get('challenge')
      });
      feedback.save()
        .then(() => this.set('status', FORM_SUBMITTED));
    },

    cancelFeedback() {
      this.set('error', null);
      this.set('status', FORM_CLOSED);
    }
  }

});

FeedbackPanel.reopenClass({
  positionalParams: ['answer']
});

export default FeedbackPanel;
