import Route from '@ember/routing/route';

export default class UserTutorialsRoute extends Route {

  async model() {
    const tutorials = await this.store.findAll('tutorial', { reload: true });
    return tutorials.filterBy('isSaved');
  }

}
