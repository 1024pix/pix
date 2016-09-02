import Ember from 'ember';
import RSVP from 'rsvp';

export default Ember.Route.extend({

  model(params) {
    const store = this.get('store');
    return RSVP.hash({
      assessment: store.findRecord('assessment', params.assessment_id)
    });
  },

  serialize: function (model) {
    return {
      assessment_id: model.assessment.id
    };
  }

});
