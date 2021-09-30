import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';

export default class CompetencesRoute extends Route.extend(SecuredRouteMixin) {
  @service currentUser;

  model(params) {
    const scorecardId = this.currentUser.user.id + '_' + params.competence_id;
    return this.store.findRecord(
      'scorecard',
      scorecardId,
    );
  }
}
