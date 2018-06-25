import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  classNames: ['card', 'text-center', 'certification-details-answer', 'border-secondary'],
  answer: null,
  jury:false,
  resultClass: computed('jury', function() {
    const jury = this.get("jury");
    return (jury)? "answer-result jury" : "answer-result";
  }),
  actions: {
    setResult(value){
      let answer = this.get("answer");
      let jury = (value !== answer.result) ? value : false;
      answer.jury = jury;
      this.set("jury", jury);
      this.get("updateRate")();
    }
  }
});
