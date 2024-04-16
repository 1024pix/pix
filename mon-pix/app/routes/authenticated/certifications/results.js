import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ResultsRoute extends Route {
  @service store;
  @service windowPostMessage;

  async model(params) {
    const certificationCourse = await this.store.findRecord('certification-course', params.certification_id);
    await certificationCourse.assessment.reload();
    return certificationCourse;
  }

  afterModel() {
    return this.windowPostMessage.stopCertification();
  }
}
