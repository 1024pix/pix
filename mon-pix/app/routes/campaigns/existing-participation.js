import Route from '@ember/routing/route';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';
import { inject as service } from '@ember/service';

export default class ExistingParticipation extends Route.extend(SecuredRouteMixin) {
  @service store;
  @service currentUser;

  model() {
    const { code } = this.paramsFor('campaigns');
    return this.store.queryRecord('schooling-registration-user-association', {
      userId: this.currentUser.user.id,
      campaignCode: code,
    });
  }
}
