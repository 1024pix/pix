import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class CreateAssessmentRoute extends Route {
  @service store;
  @service router;

  model(params) {
    return this.store.findRecord('course', params.course_id);
  }

  async afterModel(course) {
    const assessment = await this.store.createRecord('assessment', { course, type: 'DEMO' }).save();
    return this.router.replaceWith('assessments.resume', assessment.id);
  }
}
