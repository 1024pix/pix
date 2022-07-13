import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class GetRoute extends Route {
  @service session;
  @service store;
  @service router;

  beforeModel(transition) {
    this.session.requireAuthenticationAndApprovedTermsOfService(transition);
  }

  async model(params) {
    const certification = await this.store.findRecord('certification', params.id, { reload: true });
    if (!certification.isPublished || certification.status !== 'validated') {
      return this.router.replaceWith('/mes-certifications');
    }
    return certification;
  }
}
