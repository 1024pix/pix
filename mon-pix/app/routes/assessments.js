import Route from '@ember/routing/route';

export default class AssessmentsRoute extends Route {
  model(params) {
    return this.store.findRecord('assessment', params.assessment_id);
  }

  afterModel(model) {
    if (model.isCertification) {
      model.title = `Certification ${model.title}`;
    }
    return model;
  }
}
