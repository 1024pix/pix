import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({

  // Elements
  classNames: ['card', 'text-center', 'certification-details-answer', 'border-secondary'],

  // Properties
  answer: null,
  onUpdateRate:null,

  // Private properties
  _jury:false,

  // Computed properties
  resultClass: computed('_jury', function() {
    const jury = this.get('_jury');
    return (jury)? 'answer-result jury' : 'answer-result';
  }),

  // Actions
  actions: {
    setResult(value){
      let answer = this.get('answer');
      let jury = (value !== answer.result) ? value : false;
      answer.jury = jury;
      this.set('jury', jury);
      this.get('onUpdateRate')();
    }
  }
});
