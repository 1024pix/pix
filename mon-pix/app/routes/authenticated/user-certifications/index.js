import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class IndexRoute extends Route {
  @service store;

  model() {
    return this.store.findAll('certification');
  }

  @action
  loading() {
    return false;
  }
}
