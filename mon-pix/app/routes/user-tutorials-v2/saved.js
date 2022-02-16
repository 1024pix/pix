import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class UserTutorialsSavedRoute extends Route {
  @service featureToggles;
  @service router;

  redirect() {
    if (!this.featureToggles.featureToggles.isNewTutorialsPageEnabled) this.router.replaceWith('user-tutorials');
  }

  async model() {
    const userTutorials = await this.store.findAll('user-tutorial', { reload: true });
    userTutorials.sortBy('updatedAt').reverse();
    return userTutorials;
  }
}
