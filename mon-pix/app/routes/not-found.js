import Route from '@ember/routing/route';

export default Route.extend({
  afterModel(model, transition) {
    transition.abort();
    this.transitionTo('index');
  }
});
