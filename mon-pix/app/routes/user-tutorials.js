import Route from '@ember/routing/route';

export default class UserTutorialsRoute extends Route {

  async model() {
    return this.store.findAll('user-tutorial', { reload: true });
  }

}
