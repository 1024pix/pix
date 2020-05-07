import classic from 'ember-classic-decorator';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';
import Route from '@ember/routing/route';

@classic
export default class ResultsRoute extends Route.extend(SecuredRouteMixin) {
  model(params) {
    // FIXME certification number is a domain attribute and should not be queried as a technical id
    return params.certification_number;
  }
}
