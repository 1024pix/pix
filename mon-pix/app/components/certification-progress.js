import { computed } from '@ember/object';
import Component from '@ember/component';

export default Component.extend({
  currentAnswerNumber: computed('answerId', 'assessment.answers.[]', 'challengeId', function() {
    const answerIds = this.get('assessment').hasMany('answers').ids();

    const notNullAnswerIds = answerIds.filter((id) => id != null);

    const currentAnswerId = this.get('answerId');

    const foundIndex = notNullAnswerIds.indexOf(currentAnswerId);

    if (foundIndex >= 0) {
      return foundIndex + 1;
    }

    return notNullAnswerIds.length + 1;
  })
});
