import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class UserTutorialsSavedRoute extends Route {
  @service router;

  queryParams = {
    pageNumber: { refreshModel: true },
    pageSize: { refreshModel: true },
  };

  model(params) {
    return this.store.query(
      'tutorial',
      {
        type: 'saved',
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

  @action
  refreshModel() {
    this.refresh();
  }
}
