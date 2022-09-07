import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class UserTutorialsSavedRoute extends Route {
  @service router;
  @service store;

  queryParams = {
    pageNumber: { refreshModel: true },
    pageSize: { refreshModel: true },
    competences: { refreshModel: true },
  };

  async model(params) {
    const areas = this.modelFor('authenticated.user-tutorials');
    const savedTutorials = await this.store.query(
      'tutorial',
      {
        type: 'saved',
        filter: {
          competences: params.competences,
        },
        page: {
          number: params.pageNumber,
          size: params.pageSize,
        },
      },
      { reload: true }
    );
    return {
      areas,
      savedTutorials,
    };
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('pageNumber', null);
      controller.set('competences', null);
    }
  }

  @action
  refreshModel() {
    this.refresh();
  }
}
