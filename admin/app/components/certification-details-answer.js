import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({

  // Elements
  classNames: ['card', 'text-center', 'certification-details-answer', 'border-secondary'],

  // Properties
  answer: null,
  onUpdateRate: null,

  // Private properties
  _jury: false,

  // Computed properties
  resultClass: computed('_jury', function() {
    const jury = this._jury;
    return (jury) ? 'answer-result jury' : 'answer-result';
  }),

  // Actions
  actions: {
    onSetResult(value) {
      const answer = this.answer;
      const jury = (value !== answer.result) ? value : false;
      answer.jury = jury;
      this.set('_jury', jury);
      this.onUpdateRate();
    }
  }
});
