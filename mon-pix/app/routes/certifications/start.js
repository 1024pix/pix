import Route from '@ember/routing/route';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';

export default class StartRoute extends Route.extend(SecuredRouteMixin) {
  model(params) {
    return this.store.findRecord('certification-candidate-subscription', params.certification_candidate_id);
  }
}
