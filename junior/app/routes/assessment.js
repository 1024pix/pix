import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { findRecord } from '@warp-drive/utilities/json-api';

export default class AssessmentsRoute extends Route {
  @service store;

  async model(params) {
    const { content } = await this.store.request(findRecord('assessment', params.assessment_id));
    return content.data;
  }
}
