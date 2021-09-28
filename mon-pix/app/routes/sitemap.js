import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class Sitemap extends Route {
  @service currentUser;
  @service store;
  @service session

  beforeModel(transition) {
    this.session.requireAuthenticationAndApprovedTermsOfService(transition);
  }

  async model() {
    const user = this.currentUser.user;

    const profile = await user.belongsTo('profile').reload();

    const scorecards = profile.scorecards.map((scorecard) => scorecard = {
      competenceId: scorecard.competenceId,
      name: scorecard.name,
    });

    return {
      scorecards,
    };
  }
}
