import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class UserTutorialsSavedRoute extends Route {
  @service currentUser;
  @service router;
  @service store;

  queryParams = {
    pageNumber: { refreshModel: true },
    pageSize: { refreshModel: true },
  };

  async model(params) {
    const areas = this.modelFor('authenticated.user-tutorials');
    const savedTutorials = await this.store.query(
      'tutorial',
      {
        userId: this.currentUser.user.id,
        filter: {
          type: 'saved',
        },
        page: {
          number: params.pageNumber,
          size: params.pageSize,
        },
      },
      { reload: true },
    );
    return {
      areas,
      savedTutorials,
    };
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
