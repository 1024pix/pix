import Route from '@ember/routing/route';

export default class CreateAssessmentRoute extends Route {
  async afterModel(course) {
    const store = this.store;
    const assessment = await store.createRecord('assessment', { course, type: 'DEMO' }).save();
    return this.replaceWith('assessments.resume', assessment.id);
  }
}
