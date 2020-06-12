import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';
import Route from '@ember/routing/route';

export default class FillInIdPixRoute extends Route.extend(SecuredRouteMixin) {

  deactivate() {
    this.controller.set('participantExternalId', null);
    this.controller.set('isLoading', false);
  }

  async model() {
    return this.modelFor('campaigns');
  }
}
