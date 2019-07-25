import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {

  model(params) {
    return this.store.queryRecord('competenceEvaluation', { competenceId: params.competence_id, startOrResume: true });
  },

});
