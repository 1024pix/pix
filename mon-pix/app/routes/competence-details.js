import { inject as service } from '@ember/service';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';
import areaColors from 'mon-pix/static-data/area-colors';

export default Route.extend(AuthenticatedRouteMixin, {

  session: service(),

  model(params) {
    const scorecard = this.store.findRecord('scorecard', params.competence_evaluation_result_id);
    const user = this.store.findRecord('user', this.get('session.data.authenticated.userId'));

    return {
      user,
      scorecard,
    };
  },

  afterModel(model) {
    if (model.user.get('organizations.length') > 0) {
      return this.transitionTo('board');
    }
  },

  setupController(controller, model) {
    controller.set('model', model);
    controller.set('maxLevel', 5);

    model.scorecard.then((scorecard) => {
      const codeString = scorecard.area.get('code').toString();
      const foundArea = areaColors.find((color) => color.area === codeString);
      controller.set('areaColor', foundArea.color);
    });
  }
});
