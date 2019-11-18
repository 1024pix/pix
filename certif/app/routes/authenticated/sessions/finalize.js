import Route from '@ember/routing/route';

export default Route.extend({
  model({ session_id }) {
    return this.store.findRecord('session', session_id);
  }
});
