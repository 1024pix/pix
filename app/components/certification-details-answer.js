import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  classNames: ['card', 'text-center', 'certification-details-answer', 'border-secondary'],
  answer: null,
  resultClass: computed('answer.jury', function() {
    const answerJury = this.get("answer").jury;
    return (answerJury)? "answer-result jury" : "answer-result";
  }),
  actions: {
    setResult(value){
      const answer = this.get("answer");
      let jury = (value !== answer.result) ? value : false;
      answer.jury = jury;
      this.get("updateRate")();
    }
  }
});
