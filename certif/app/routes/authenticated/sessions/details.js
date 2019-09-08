import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    this.set('message', null);
    return this.store.findRecord('session', params.session_id);
  },
});
