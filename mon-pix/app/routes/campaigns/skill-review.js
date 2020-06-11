import classic from 'ember-classic-decorator';
import { inject as service } from '@ember/service';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';
import Route from '@ember/routing/route';

@classic
export default class SkillReviewRoute extends Route.extend(SecuredRouteMixin) {
  @service currentUser;

  async model(params) {
    const campaign = this.modelFor('campaigns');
    const campaignParticipation = await this.store.queryRecord('campaignParticipation', { campaignId: campaign.id, userId: this.currentUser.user.id });
    const assessment = await this.store.findRecord('assessment', params.assessment_id);
    return {
      campaignParticipation,
      assessment,
    };
  }

  async afterModel(model) {
    await model.campaignParticipation.belongsTo('campaignParticipationResult').reload();
    await model.campaignParticipation.belongsTo('campaign').reload({ include: 'targetProfile' });
    const improvableNextChallenge = await this.store.queryRecord('challenge', { assessmentId: model.assessment.id, tryImproving: true });
    this.controllerFor('campaigns.skill-review').set('displayImprovementButton', !!improvableNextChallenge);
  }
}
