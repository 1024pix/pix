import { service } from '@ember/service';
import Route from '@ember/routing/route';

export default class Sitemap extends Route {
  @service currentUser;

  async model() {
    const user = this.currentUser.user;

    const profile = await user.belongsTo('profile').reload();

    const scorecards = profile.scorecards.map(
      (scorecard) =>
        (scorecard = {
          competenceId: scorecard.competenceId,
          name: scorecard.name,
        }),
    );

    return {
      scorecards,
    };
  }
}
