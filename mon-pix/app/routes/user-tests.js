import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { isEmpty } from '@ember/utils';

export default class UserTestsRoute extends Route {
  @service store;
  @service session;
  @service currentUser;

  beforeModel(transition) {
    this.session.requireAuthenticationAndApprovedTermsOfService(transition);
  }

  model() {
    const user = this.currentUser.user;
    const maximumDisplayed = 100;
    const queryParams = {
      'userId': user.id,
      'page[number]': 1,
      'page[size]': maximumDisplayed,
      'filter[states]': ['ONGOING', 'TO_SHARE', 'ENDED', 'ARCHIVED'],
    };

    return this.store.query('campaign-participation-overview', queryParams);
  }

  redirect(model) {
    if (isEmpty(model)) {
      this.replaceWith('');
    }
  }
}
