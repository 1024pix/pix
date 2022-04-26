import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class UserTutorialsRecommendedRoute extends Route {
  @service router;

  queryParams = {
    pageNumber: { refreshModel: true },
    pageSize: { refreshModel: true },
  };

  model(params) {
    return this.store.query(
      'tutorial',
      {
        type: 'recommended',
        page: {
          number: params.pageNumber,
          size: params.pageSize,
        },
      },
      { reload: true }
    );
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('pageNumber', null);
    }
  }
}
