import { inject as service } from '@ember/service';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';

export default Route.extend(AuthenticatedRouteMixin, {

  session: service(),
  
  async model(params) {
    const user = await this.store.findRecord('user', this.get('session.data.authenticated.userId'));

    if (user.get('organizations.length') > 0) {
      return this.transitionTo('board');
    }

    await user.competences;
    
    const competenceId = params.scorecard_id.split('_')[1];
    const competence = user.competences.find((competence) => competence.id === competenceId);
    
    return {
      competence,
      scorecard: this.store.findRecord('scorecard', params.scorecard_id),
    };
  },

});
