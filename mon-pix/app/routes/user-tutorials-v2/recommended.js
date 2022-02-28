import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class UserTutorialsRecommendedRoute extends Route {
  @service featureToggles;
  @service router;

  redirect() {
    if (!this.featureToggles.featureToggles.isNewTutorialsPageEnabled) this.router.replaceWith('user-tutorials');
  }

  model() {
    return this.store.query('tutorial', { type: 'recommended' }, { reload: true });
  }
}
