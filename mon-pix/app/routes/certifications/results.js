import classic from 'ember-classic-decorator';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';

@classic
export default class ResultsRoute extends Route.extend(AuthenticatedRouteMixin) {
  model(params) {
    // FIXME certification number is a domain attribute and should not be queried as a technical id
    return params.certification_number;
  }
}
