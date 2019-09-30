import { computed } from '@ember/object';
import Component from '@ember/component';

export default Component.extend({
  currentAnswerNumber: computed('assessment.answers.length', function() {
    return this.get('assessment.answers.length') + 1;
  })
});
