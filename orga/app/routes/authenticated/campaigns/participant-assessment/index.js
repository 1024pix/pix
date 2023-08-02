import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class IndexRoute extends Route {
  @service router;

  redirect() {
    this.router.replaceWith('authenticated.campaigns.participant-assessment.results');
  }
}
