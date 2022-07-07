import Route from '@ember/routing/route';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';
import { inject as service } from '@ember/service';

export default class IndexRoute extends Route.extend(SecuredRouteMixin) {
  @service router;

  redirect() {
    this.router.replaceWith('user-dashboard');
  }
}
