import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default Route.extend({

  afterModel(assesssment) {
    return RSVP.hash({
      assesssment,
      skillReview: this.get('store').findRecord('skillReview', assesssment.get('skillReview.id'))
    });
  },

  actions: {
    openComparison(assessment_id, answer_id, index) {
      this.transitionTo('assessments.comparison', assessment_id, answer_id, index);
    },
  },
});
