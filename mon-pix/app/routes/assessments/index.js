import Route from '@ember/routing/route';

export default class AssessmentsIndexRoute extends Route {

  beforeModel(params) {
    return this.replaceWith('assessments.resume', params.assessment_id);
  }

}
