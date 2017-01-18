import Ember from 'ember';
import callOnlyOnce from '../utils/call-only-once';
import _ from 'pix-live/utils/lodash-custom';

const get = Ember.get;

const ChallengeItemGeneric = Ember.Component.extend({
  tagName: 'article',
  classNames: ['challenge-item'],
  attributeBindings: ['challenge.id:data-challenge-id'],

  hasUserConfirmWarning: Ember.computed('challenge', function () {
    return false;
  }),

  hasChallengeTimer: Ember.computed('challenge', function () {
    return this.hasTimerDefined();
  }),

  hasTimerDefined(){
    return _.isInteger(get(this, 'challenge.timer'));
  },

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
    }),

    setUserConfirmation: callOnlyOnce(function () {
      this.toggleProperty('hasUserConfirmWarning');
      this.toggleProperty('hasChallengeTimer');
    }),
  }

});

export default ChallengeItemGeneric;
