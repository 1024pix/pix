import { computed } from '@ember/object';
import Component from '@ember/component';

const classByResultValue = {
  ok: 'correction-qroc-box__input-right-answer',
  ko: 'correction-qroc-box__input-wrong-answer',
  aband: 'correction-qroc-box__input-no-answer'
};

export default Component.extend({

  answer: null,
  solution: null,

  inputClass: computed('answer.result', function() {
    return classByResultValue[this.get('answer.result')] || '';
  }),

  isResultOk: computed('answer', function() {
    return this.get('answer.result') === 'ok';
  }),

  answerToDisplay: computed('answer', function() {
    const answer = this.get('answer.value');
    if (answer === '#ABAND#') {
      return 'Pas de réponse';
    }
    return answer;
  }),

  solutionToDisplay: computed('solution.value', function() {
    const solutionVariants = this.get('solution.value');
    if (!solutionVariants) {
      return '';
    }
    return solutionVariants.split('\n')[0];
  })
});
