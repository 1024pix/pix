import RSVP from 'rsvp';
import BaseRoute from 'pix-live/routes/base-route';

export default BaseRoute.extend({

  model(params) {
    return this
      .get('store')
      .findRecord('course', params.course_id)
      .then((course) => {
        return RSVP.hash({
          course,
          nextChallenge: course.get('challenges.firstObject')
        });
      });
  }
});
