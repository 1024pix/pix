import Route from '@ember/routing/route';

export default class IndexRoute extends Route {

  beforeModel() {
    this.replaceWith('authenticated.organizations.get.members');
  }
}
