import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class UserTutorialsRecommendedRoute extends Route {
  @service router;
  @service store;

  queryParams = {
    pageNumber: { refreshModel: true },
    pageSize: { refreshModel: true },
    competences: { refreshModel: true },
  };

  async model(params) {
    const areas = this.modelFor('authenticated.user-tutorials');
    const recommendedTutorials = await this.store.query(
      'tutorial',
      {
        type: 'recommended',
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
      recommendedTutorials,
    };
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('pageNumber', null);
      controller.set('competences', null);
    }
  }
}
