import Route from '@ember/routing/route';

export default class UserTutorialsRoute extends Route {

  async model() {
    const tutorials = await this.store.findAll('tutorial');
    return tutorials.filter((tutorial) => tutorial.isSaved);
  }

}
