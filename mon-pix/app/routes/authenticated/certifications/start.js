import classic from 'ember-classic-decorator';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

@classic
export default class StartRoute extends Route.extend(AuthenticatedRouteMixin) {
  @service currentUser;

  model() {
    const user = this.currentUser.user;
    return user.belongsTo('certificationProfile').reload();
  }
}
