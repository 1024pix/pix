import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class AssessmentsRoute extends Route {
  @service storeRequest;

  async model(params) {
    const { content } = await this.storeRequest.findRecord('assessment', params.assessment_id);
    return content.data;
  }
}
