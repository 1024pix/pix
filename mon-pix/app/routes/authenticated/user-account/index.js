import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class IndexRoute extends Route {
  @service router;

  redirect() {
    this.router.replaceWith('authenticated.user-account.personal-information');
  }
}
