import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ResultsRoute extends Route {
  @service store;
  @service pixCompanion;

  async model(params) {
    const certificationCourse = await this.store.findRecord('certification-course', params.certification_id);
    const assessment = await certificationCourse.assessment.reload();

    return { certificationCourse, assessment };
  }

  afterModel() {
    return this.pixCompanion.stopCertification();
  }
}
