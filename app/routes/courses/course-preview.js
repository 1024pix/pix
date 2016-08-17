import Ember from 'ember';

export default Ember.Route.extend({

  model(params) {

    const store = this.get('store');
    const controller = this.controllerFor(this.routeName);

    return store.findRecord('course', params.course_id).then((course) => {
      controller.set('course', course);
      controller.set('nextChallenge', course.get('challenges.firstObject'));
    });
  }

});
