import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class GetRoute extends Route {
  @service store;
  @service session;

  beforeModel(transition) {
    this.session.requireAuthenticationAndApprovedTermsOfService(transition);
  }

  async model(params) {
    const certification = await this.store.findRecord('certification', params.id, { reload: true });
    if (!certification.isPublished || certification.status !== 'validated') {
      return this.replaceWith('/mes-certifications');
    }
    return certification;
  }
}
