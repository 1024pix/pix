import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CreateAssessmentRoute extends Route {
  @service store;

  async afterModel(course) {
    const store = this.store;
    const assessment = await store.createRecord('assessment', { course, type: 'DEMO' }).save();
    return this.replaceWith('assessments.resume', assessment.id);
  }
}
