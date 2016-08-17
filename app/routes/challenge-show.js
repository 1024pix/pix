import Ember from 'ember';

export default Ember.Route.extend({
  model(params) {

    const store = this.get('store');
    const controller = this.controllerFor(this.routeName);

    return store.findRecord('challenge', params.id_challenge)
      .then((challenge) => {
        controller.set('challenge', challenge);
        return challenge.get('assessment');
      })
      .then((assessment) => {
        controller.set('assessment', assessment);
        return assessment.get('course');
      })
      .then((course) => {
        controller.set('course', course);
      });
  }
});

