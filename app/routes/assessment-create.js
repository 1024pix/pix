import Ember from 'ember';

export default Ember.Route.extend({
  model(params) {
    const store = this.get('store');

    let assessment = store.createRecord('assessment');

    return store
      .findRecord('course', params.id_course)
      .then((course) => {
        assessment.set('course', course);
        return assessment.save();
      });
  },

  afterModel(model) {
    this.transitionTo('assessment-show', model.id);
  }
});
