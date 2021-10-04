import Route from '@ember/routing/route';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';
import { inject as service } from '@ember/service';
export default class GetRoute extends Route.extend(SecuredRouteMixin) {
  @service store;

  async model(params) {
    const certification = await this.store.findRecord('certification', params.id, { reload: true });
    if (!certification.isPublished || certification.status !== 'validated') {
      return this.replaceWith('/mes-certifications');
    }
    return certification;
  }
}
