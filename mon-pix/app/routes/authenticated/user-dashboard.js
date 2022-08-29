import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import Route from '@ember/routing/route';

export default class UserDashboard extends Route {
  @service store;
  @service currentUser;

  async model() {
    const user = this.currentUser.user;
    const maximumDisplayed = 9;
    const queryParams = {
      userId: user.id,
      'page[number]': 1,
      'page[size]': maximumDisplayed,
      'filter[states]': ['ONGOING', 'TO_SHARE'],
    };
    const campaignParticipationOverviews = await this.store.query('campaign-participation-overview', queryParams);

    const profile = await user.belongsTo('profile').reload();
    const scorecards = profile.scorecards;

    return {
      campaignParticipationOverviews,
      scorecards,
    };
  }

  @action
  loading(transition) {
    return transition?.from?.name.startsWith('assessments.');
  }
}
