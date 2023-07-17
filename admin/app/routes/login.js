import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class LoginRoute extends Route {
  @service session;

  beforeModel(transition) {
    console.log(transition.from);
    this.session.prohibitAuthentication('authenticated');
  }
}
