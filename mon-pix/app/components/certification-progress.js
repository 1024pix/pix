import { computed } from '@ember/object';
import { mapBy } from '@ember/object/computed';
import Component from '@ember/component';

export default Component.extend({
  challenges: mapBy('assessment.answers', 'challenge'),

  challengeIds: mapBy('challenges', 'id'),

  currentAnswerNumber: computed('challengeId', 'challengeIds', function() {
    const challengeIds = this.get('challengeIds');
    const currentChallengeId = this.get('challengeId');

    const foundIndex = challengeIds.indexOf(currentChallengeId);

    if (foundIndex >= 0) {
      return foundIndex + 1;
    }

    if (challengeIds.indexOf(undefined) >= 0) {
      return '';
    }

    return challengeIds.length + 1;
  })
});
