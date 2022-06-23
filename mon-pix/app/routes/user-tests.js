import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { isEmpty } from '@ember/utils';

export default class UserTestsRoute extends Route {
  @service currentUser;
  @service session;
  @service store;
  @service router;

  beforeModel(transition) {
    const isUserLoaded = !!this.currentUser.user;
    const isAuthenticated = this.session.get('isAuthenticated');
    if (!isAuthenticated || !isUserLoaded) {
      this.session.set('attemptedTransition', transition);
      this.router.transitionTo('login');
    } else if (this.currentUser.user.mustValidateTermsOfService) {
      this.session.set('attemptedTransition', transition);
      this.router.transitionTo('terms-of-service');
    } else {
      return super.beforeModel(...arguments);
    }
  }

  model() {
    const user = this.currentUser.user;
    const maximumDisplayed = 100;
    const queryParams = {
      userId: user.id,
      'page[number]': 1,
      'page[size]': maximumDisplayed,
      'filter[states]': ['ONGOING', 'TO_SHARE', 'ENDED', 'DISABLED'],
    };

    return this.store.query('campaign-participation-overview', queryParams);
  }

  redirect(model) {
    if (isEmpty(model)) {
      this.router.replaceWith('');
    }
  }

  @action
  loading() {
    return false;
  }
}
