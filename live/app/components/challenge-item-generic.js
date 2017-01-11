import Ember from 'ember';
import callOnlyOnce from '../utils/call-only-once';

const ChallengeItemGeneric = Ember.Component.extend({

  tagName: 'article',
  classNames: ['challenge-item'],
  attributeBindings: ['challenge.id:data-challenge-id'],

  _getTimeout() {
    return $('.timeout-jauge-remaining').attr('data-spent');
  },

  actions: {

    validate: callOnlyOnce(function () {
      if (this._hasError()) {
        this.set('errorMessage', this._getErrorMessage());
        return this.sendAction('onError', this.get('errorMessage'));
      }
      const answerValue = this._getAnswerValue();
      this.sendAction('onValidated', this.get('challenge'), this.get('assessment'), answerValue, this._getTimeout());
    }),

    skip: callOnlyOnce(function () {
      this.set('errorMessage', null);
      this.sendAction('onValidated', this.get('challenge'), this.get('assessment'), '#ABAND#', this._getTimeout());
    })
  }

});

export default ChallengeItemGeneric;
