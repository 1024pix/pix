import Route from '@ember/routing/route';
import { service } from '@ember/service';
import isEmpty from 'lodash/isEmpty';

export default class ListRoute extends Route {
  @service store;

  async model() {
    let complementaryCertifications;
    try {
      complementaryCertifications = await this.store.findAll('complementary-certification');
    } catch (errorResponse) {
      if (!isEmpty(errorResponse)) {
        errorResponse.errors.forEach((error) => this.notifications.error(error.detail));
      }
      return [];
    }
    return complementaryCertifications;
  }
}
