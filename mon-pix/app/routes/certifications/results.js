import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ResultsRoute extends Route {

  @service session;

  beforeModel(transition) {
    this.session.requireAuthenticationAndApprovedTermsOfService(transition);
  }

  model(params) {
    // FIXME certification number is a domain attribute and should not be queried as a technical id
    return params.certification_number;
  }
}
