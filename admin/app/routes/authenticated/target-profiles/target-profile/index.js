import Route from '@ember/routing/route';

export default class IndexRoute extends Route {

  beforeModel() {
    this.replaceWith('authenticated.target-profiles.target-profile.details');
  }
}
