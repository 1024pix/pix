import { inject as service } from '@ember/service';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';
import Route from '@ember/routing/route';

export default class UserDashboard extends Route.extend(SecuredRouteMixin) {
  @service currentUser;
  @service store;

  async model() {
    const userId = this.currentUser.user.id;
    const maximumDisplayed = 9;
    const queryParams = {
      userId,
      'page[number]': 1,
      'page[size]': maximumDisplayed,
      'filter[states]': ['ONGOING', 'TO_SHARE'],
    };
    return await this.store.query('campaign-participation-overview', queryParams);
  }
}
