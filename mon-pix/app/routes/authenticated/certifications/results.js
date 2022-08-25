import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ResultsRoute extends Route {
  @service store;

  async model(params) {
    const certificationCourse = await this.store.findRecord('certification-course', params.certification_id);
    await certificationCourse.assessment.reload();
    return certificationCourse;
  }
}
