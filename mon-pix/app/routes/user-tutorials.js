import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class UserTutorialsRoute extends Route {
  @service store;

  async model() {
    const userTutorials = await this.store.findAll('user-tutorial', { reload: true });
    userTutorials.sortBy('updatedAt').reverse();
    return userTutorials;
  }

}
