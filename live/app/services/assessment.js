import Ember from 'ember';

export default Ember.Service.extend({

  getNextChallenge(currentChallenge, assessment) {

    return assessment
      .get('course')
      .then((course) => course.get('challenges'))
      .then((challenges) => {
        if (challenges.get('lastObject.id') === currentChallenge.get('id')) {
          return null;
        }
        return challenges.objectAt(challenges.indexOf(currentChallenge) + 1);
      });
  }

});
