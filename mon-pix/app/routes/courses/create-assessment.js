import Route from '@ember/routing/route';

export default Route.extend({

  async afterModel(course) {
    const store = this.store;
    const assessment = await store.createRecord('assessment', { course, type: course.type }).save();
    return this.replaceWith('assessments.resume', assessment.id);
  },
});
