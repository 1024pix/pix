import Route from '@ember/routing/route';
import { action } from '@ember/object';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';
import { inject as service } from '@ember/service';

export default class IndexRoute extends Route.extend(SecuredRouteMixin) {
  @service store;

  model() {
    return this.store.findAll('certification');
  }

  @action
  loading() {
    return false;
  }
}
