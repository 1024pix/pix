import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CreateAssessmentRoute extends Route {
  @service store;
  @service router;

  async afterModel(course) {
    const store = this.store;
    const assessment = await store.createRecord('assessment', { course, type: 'DEMO' }).save();
    return this.router.replaceWith('assessments.resume', assessment.id);
  }
}
