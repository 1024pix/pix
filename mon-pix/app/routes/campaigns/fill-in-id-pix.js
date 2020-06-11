import { inject as service } from '@ember/service';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';
import Route from '@ember/routing/route';

export default class FillInIdPixRoute extends Route.extend(SecuredRouteMixin) {
  @service session;
  @service currentUser;

  deactivate() {
    this.controller.set('participantExternalId', null);
    this.controller.set('isLoading', false);
  }

  async model() {
    return this.modelFor('campaigns');
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.set('start', (participantExternalId) => this.start(participantExternalId));
  }

  async start(participantExternalId = null) {
    this.transitionTo('campaigns.start-or-resume', this.modelFor('campaigns'), { queryParams: { participantExternalId } });
  }
}
