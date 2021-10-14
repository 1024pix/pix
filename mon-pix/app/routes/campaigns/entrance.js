import Route from '@ember/routing/route';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';

export default class Entrance extends Route.extend(SecuredRouteMixin) {
  model() {
    return this.modelFor('campaigns');
  }
}
