import Ember from 'ember';
import RSVP from 'rsvp';

export default Ember.Route.extend({

  model(params) {
    return this.get('store').findRecord('course', params.course_id).then((course) => {
      return RSVP.hash({
        course,
        nextChallenge: course.get('challenges.firstObject')
      });
    });
  }

});
