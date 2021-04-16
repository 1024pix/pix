import Route from '@ember/routing/route';

export default class ConnectionMethodsRoute extends Route {

  model() {
    return this.modelFor('user-account');
  }

}
