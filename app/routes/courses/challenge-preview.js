import Ember from 'ember';
import RSVP from 'rsvp';

export default Ember.Route.extend({

  model(params) {

    const store = this.get('store');
    const controller = this.controllerFor(this.routeName);

    const promises = {
      course: store.findRecord('course', params.course_id),
      challenge: store.findRecord('challenge', params.challenge_id)
    };

    RSVP.hash(promises).then(function (results) {

      const course = results.course;
      const challenge = results.challenge;
      const challenges = course.get('challenges');
      const currentChallengeIndex = challenges.indexOf(challenge);
      const hasNextChallenge =  currentChallengeIndex + 1 < challenges.get('length');
      const nextChallenge = challenges.objectAt(challenges.indexOf(challenge) + 1);

      controller.set('course', course);
      controller.set('challenge', challenge);
      controller.set('nextChallenge', nextChallenge);
      controller.set('hasNextChallenge', hasNextChallenge);
    });
  }
});
