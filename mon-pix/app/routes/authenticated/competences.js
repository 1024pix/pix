import classic from 'ember-classic-decorator';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

@classic
export default class CompetencesRoute extends Route.extend(AuthenticatedRouteMixin) {
  @service currentUser;

  model(params) {
    const scorecardId = this.currentUser.user.id + '_' + params.competence_id;
    return this.store.findRecord(
      'scorecard',
      scorecardId
    );
  }
}
