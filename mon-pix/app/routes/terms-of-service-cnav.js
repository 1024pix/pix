import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class TermsOfServiceCnavRoute extends Route {
  @service session;

  beforeModel() {
    this.session.prohibitAuthentication('user-dashboard');
  }
}
