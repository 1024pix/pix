import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class UserTutorialsSavedRoute extends Route {
  @service featureToggles;
  @service router;

  queryParams = {
    pageNumber: { refreshModel: true },
    pageSize: { refreshModel: true },
  };

  redirect() {
    if (!this.featureToggles.featureToggles.isNewTutorialsPageEnabled) this.router.replaceWith('user-tutorials');
  }

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
