import Component from '@ember/component';

export default Component.extend({
  didReceiveAttrs() {
    this.set('currentAnswerNumber', this.get('assessment.answers.length') + 1);
  },
});
