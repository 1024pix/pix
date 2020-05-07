import classic from 'ember-classic-decorator';
import RSVP from 'rsvp';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';
import Route from '@ember/routing/route';

@classic
export default class SkillReviewRoute extends Route.extend(SecuredRouteMixin) {
  model(params) {
    const store = this.store;
    const assessmentId = params.assessment_id;
    return RSVP.hash({
      campaignParticipation: store.query('campaignParticipation', { filter: { assessmentId } })
        .then((campaignParticipations) => campaignParticipations.get('firstObject')),
      assessment: store.findRecord('assessment', assessmentId),
    });
  }

  async afterModel(model) {
    await model.campaignParticipation.belongsTo('campaignParticipationResult').reload();
    await model.campaignParticipation.belongsTo('campaign').reload({ include: 'targetProfile' });
    const improvableNextChallenge = await this.store.queryRecord('challenge', { assessmentId: model.assessment.id, tryImproving: true });
    this.controllerFor('campaigns.skill-review').set('displayImprovementButton', !!improvableNextChallenge);
  }
}
