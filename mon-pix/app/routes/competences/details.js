import classic from 'ember-classic-decorator';
import { inject as service } from '@ember/service';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';
import Route from '@ember/routing/route';

@classic
export default class DetailsRoute extends Route.extend(SecuredRouteMixin) {
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
