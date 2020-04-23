import classic from 'ember-classic-decorator';
import { inject as service } from '@ember/service';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';

@classic
export default class DetailsRoute extends Route.extend(AuthenticatedRouteMixin) {
  @service currentUser;
  @service session;

  model(params, transition) {
    const scorecardId = this.currentUser.user.id + '_' + transition.to.parent.params.competence_id;
    return this.store.peekRecord('scorecard', scorecardId, {
      reload: true,
    });
  }

  afterModel(scorecard) {
    return scorecard.hasMany('tutorials').reload();
  }
}
