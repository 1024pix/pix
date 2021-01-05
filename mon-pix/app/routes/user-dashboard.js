import { inject as service } from '@ember/service';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';
import Route from '@ember/routing/route';

export default class UserDashboard extends Route.extend(SecuredRouteMixin) {
  @service currentUser;
  @service store;

  async model() {
    const user = this.currentUser.user;
    const nbCampaignParticipationOverviews = 9;
    const queryParams = {
      'userId': user.id,
      'page[number]': 1,
      'page[size]': nbCampaignParticipationOverviews,
      'filter[states]': ['ONGOING', 'TO_SHARE'],
    };
    return await this.store.query('campaign-participation-overview', queryParams);
  }
}
