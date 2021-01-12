import Route from '@ember/routing/route';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';

export default class GetRoute extends Route.extend(SecuredRouteMixin) {
  async model(params) {
    const certification = await this.store.findRecord('certification', params.id, { reload: true });
    if (!certification.isPublished || certification.status !== 'validated') {
      return this.replaceWith('/mes-certifications');
    }
    return certification;
  }
}
