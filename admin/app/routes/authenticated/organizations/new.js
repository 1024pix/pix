import Route from '@ember/routing/route';

export default Route.extend({

  model() {
    this._super(...arguments);
    return this.store.createRecord('organization');
  }

});
