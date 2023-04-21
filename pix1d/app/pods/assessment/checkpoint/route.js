import Route from '@ember/routing/route';

export default class CheckpointRoute extends Route {
  async model() {
    const { assessment_id } = this.paramsFor('assessment');
    return assessment_id;
  }
}
