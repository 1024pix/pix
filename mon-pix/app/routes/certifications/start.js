import classic from 'ember-classic-decorator';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';

@classic
export default class StartRoute extends Route.extend(SecuredRouteMixin) {
  @service currentUser;

  model() {
    const user = this.currentUser.user;
    return user.belongsTo('certificationProfile').reload();
  }
}
