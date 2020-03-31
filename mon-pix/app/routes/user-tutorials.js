import Route from '@ember/routing/route';

export default class UserTutorialsRoute extends Route {

  model() {
    return this.store.findAll('tutorial');
  }

}
