import { inject as service } from '@ember/service';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';
import Route from '@ember/routing/route';

export default class Sitemap extends Route.extend(SecuredRouteMixin) {
  @service currentUser;
  @service store;

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
