import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';
import Route from '@ember/routing/route';

export default class SkillReviewRoute extends Route.extend(SecuredRouteMixin) {
  async model() {
    const user = this.currentUser.user;
    const campaign = this.modelFor('campaigns');
    const campaignParticipationResult = await this.store.queryRecord('campaignParticipationResult', { campaignId: campaign.id, userId: user.id });
    return { campaign, campaignParticipationResult };
  }
}
