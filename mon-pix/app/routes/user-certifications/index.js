import classic from 'ember-classic-decorator';
import Route from '@ember/routing/route';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';

@classic
export default class IndexRoute extends Route.extend(SecuredRouteMixin) {
  model() {
    return this.store.findAll('certification');
  }
}
