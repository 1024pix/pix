import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';
import Route from '@ember/routing/route';

export default class ResultsRoute extends Route.extend(SecuredRouteMixin) {
  async model(params) {
    const certificationCourse = await this.store.findRecord('certification-course', params.certification_id);
    await certificationCourse.assessment.reload();
    return certificationCourse;
  }
}
