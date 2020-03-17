import Route from '@ember/routing/route';

export default class NewRoute extends Route {

  model() {
    return this.store.createRecord('organization');
  }
}
