import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';
import Route from '@ember/routing/route';

export default class AssessmentRoute extends Route.extend(SecuredRouteMixin) {
  async model() {
    const campaign = this.modelFor('campaigns');
    const campaignAssessment = await this.store.query('assessment', {
      filter: { type: 'CAMPAIGN', codeCampaign: campaign.code },
    });
    const assessment = await campaignAssessment.get('firstObject');
    return {
      assessment,
      campaign,
    };
  }
}
