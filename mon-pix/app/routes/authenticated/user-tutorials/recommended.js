import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class UserTutorialsRecommendedRoute extends Route {
  @service currentUser;
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
        userId: this.currentUser.user.id,
        filter: {
          competences: params.competences,
          type: 'recommended',
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
