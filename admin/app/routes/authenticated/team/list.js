import Route from '@ember/routing/route';

export default class ListRoute extends Route {
  async model() {
    return this.store.query('admin-member', {});
  }
}
