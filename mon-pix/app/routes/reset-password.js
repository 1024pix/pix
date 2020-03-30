import classic from 'ember-classic-decorator';
import { inject as service } from '@ember/service';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';
import Route from '@ember/routing/route';

@classic
export default class ResetPasswordRoute extends Route.extend(UnauthenticatedRouteMixin) {
  @service session;

  async model(params) {
    const passwordResetTemporaryKey = params.temporary_key;
    const user = await this.store.queryRecord('user', { passwordResetTemporaryKey });
    return { user, temporaryKey: passwordResetTemporaryKey };
  }
}
