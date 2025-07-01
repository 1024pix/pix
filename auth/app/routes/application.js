import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ApplicationRoute extends Route {
  @service authentication;

  async beforeModel() {
    await this.authentication.setup();
  }
}
