import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default class CertificationCentersGetRoute extends Route.extend(AuthenticatedRouteMixin) {

  model(params) {
    return this.store.findRecord('certification-center', params.certification_center_id);
  }
}
