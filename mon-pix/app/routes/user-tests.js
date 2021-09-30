import { inject as service } from '@ember/service';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';
import Route from '@ember/routing/route';
import { isEmpty } from '@ember/utils';

export default class UserTestsRoute extends Route.extend(SecuredRouteMixin) {
  @service store;

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
