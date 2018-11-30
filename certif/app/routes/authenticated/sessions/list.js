import Route from '@ember/routing/route';

export default Route.extend({

  model() {
    const store = this.get('store');
    return store.findAll('session');
  },

});
