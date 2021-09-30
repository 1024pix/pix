import Route from '@ember/routing/route';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';

export default class IndexRoute extends Route.extend(SecuredRouteMixin) {
  model() {
    return this.store.findAll('certification');
  }
}
