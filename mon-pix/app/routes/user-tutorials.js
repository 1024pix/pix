import Route from '@ember/routing/route';

export default class UserTutorialsRoute extends Route {

  async model() {
    const userTutorials = await this.store.findAll('user-tutorial', { reload: true });
    userTutorials.sortBy('updatedAt').reverse();
    return userTutorials;
  }

}
