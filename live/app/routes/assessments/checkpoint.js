import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default Route.extend({

  afterModel(assesssment) {
    return RSVP.hash({
      assesssment,
      skillReview: this.get('store').findRecord('skillReview', assesssment.get('skillReview.id'))
    });
  },

});
