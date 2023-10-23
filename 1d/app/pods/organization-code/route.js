import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class OrganizationCodeRoute extends Route {
  @service currentLearner;

  async beforeModel() {
    this.currentLearner.remove();
  }
}
