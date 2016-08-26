import Ember from 'ember';
import RSVP from 'rsvp';

export default Ember.Route.extend({

  model(params) {

    const store = this.get('store');

    const promises = {
      course: store.findRecord('course', params.course_id),
      challenge: store.findRecord('challenge', params.challenge_id)
    };

    return RSVP.hash(promises).then(function (results) {

      const course = results.course;
      const challenge = results.challenge;
      const challenges = course.get('challenges');
      const currentChallengeIndex = challenges.indexOf(challenge);
      const nextChallenge = challenges.objectAt(challenges.indexOf(challenge) + 1);
      const hasNextChallenge = currentChallengeIndex + 1 < challenges.get('length');

      return {
        course,
        challenge,
        hasNextChallenge,
        nextChallenge
      };
    });
  }
});
