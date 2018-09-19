import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default Route.extend({

  afterModel(assessment) {

    return RSVP.hash({
      assessment,
      skillReview: assessment.belongsTo('skillReview').reload()
    });
  },

});
