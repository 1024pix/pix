import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class SkillReviewRoute extends Route.extend(SecuredRouteMixin) {
  @service router;
  @service store;

  async model() {
    const user = this.currentUser.user;
    const { campaignParticipation, campaign } = this.modelFor('campaigns.assessment');
    try {
      const campaignParticipationResult = await this.store.queryRecord('campaignParticipationResult', {
        campaignId: campaign.id,
        userId: user.id,
      });
      const trainings = await campaignParticipation.hasMany('trainings').reload();
      return { campaign, campaignParticipationResult, trainings };
    } catch (error) {
      if (error.errors?.[0]?.status === '412') {
        this.router.transitionTo('campaigns.entry-point', campaign.code);
        return;
      } else throw error;
    }
  }
}
