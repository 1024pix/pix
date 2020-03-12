import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class IndexRoute extends Route {

  @service currentUser;

  beforeModel() {
    return this.replaceWith('authenticated.campaigns');
  }
}
