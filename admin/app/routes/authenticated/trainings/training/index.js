import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class IndexRoute extends Route {
  @service router;

  beforeModel() {
    this.router.replaceWith('authenticated.trainings.training.triggers');
  }
}
