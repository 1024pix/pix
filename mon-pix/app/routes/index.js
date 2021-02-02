import Route from '@ember/routing/route';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';
import ENV from 'mon-pix/config/environment';

export default class IndexRoute extends Route.extend(SecuredRouteMixin) {
  redirect() {
    if (ENV.APP.FT_DASHBOARD) {
      this.replaceWith('user-dashboard');
    } else {
      this.replaceWith('profile');
    }
  }
}
