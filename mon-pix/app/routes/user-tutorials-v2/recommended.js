import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class UserTutorialsRecommendedRoute extends Route {
  @service featureToggles;
  @service router;

  queryParams = {
    'page[number]': { refreshModel: true },
    'page[size]': { refreshModel: true },
  };

  redirect() {
    if (!this.featureToggles.featureToggles.isNewTutorialsPageEnabled) this.router.replaceWith('user-tutorials');
  }

  model(params) {
    return this.store.query(
      'tutorial',
      {
        type: 'recommended',
        ...params,
      },
      { reload: true }
    );
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('page[number]', 1);
    }
  }
}
