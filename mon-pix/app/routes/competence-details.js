import { inject as service } from '@ember/service';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';
import areaColors from 'mon-pix/static-data/area-colors';

const NUMBER_OF_PIX_BY_LEVEL = 8;
const MAX_DISPLAYED_PERCENTAGE = 95;

export default Route.extend(AuthenticatedRouteMixin, {

  session: service(),

  model(params) {
    return {
      user: this.store.findRecord('user', this.get('session.data.authenticated.userId')),
      scorecard: this.store.findRecord('scorecard', params.scorecard_id),
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
      const competenceId = scorecard.id.split('_')[1];
      const codeString = scorecard.get('area.code').toString();
      const foundArea = areaColors.find((color) => color.area === codeString);
      const percentage = Math.min(MAX_DISPLAYED_PERCENTAGE, scorecard.pixScoreAheadOfNextLevel / NUMBER_OF_PIX_BY_LEVEL * 100);

      controller.set('areaColor', foundArea.color);
      controller.set('percentageAheadOfNextLevel', percentage);

      model.user.then((user) => {
        user.competences.then((competences) => {
          const competence = competences.find((competence) => competence.id === competenceId);
          const { daysBeforeNewAttempt } = competence;

          controller.set('competence', competence);
          controller.set('remainingDaysText', `Disponible dans ${daysBeforeNewAttempt} ${daysBeforeNewAttempt <= 1 ? 'jour' : 'jours'}`);
        });
      });
    });
  }
});
