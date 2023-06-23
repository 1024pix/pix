import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ChallengeRoute extends Route {
  @service router;
  @service store;

  async model(params, transition) {
    const assessment = await this.modelFor('assessment');
    let challenge;
    try {
      const challengeId = transition?.to.queryParams.challengeId;
      if (assessment.type === 'PREVIEW' && challengeId) {
        challenge = await this.store.findRecord('challenge', challengeId);
      } else {
        challenge = await this.store.queryRecord('challenge', { assessmentId: assessment.id });
      }
      return { assessment, challenge };
    } catch (err) {
      return this.router.replaceWith('assessment.resume', assessment.id, {
        queryParams: { assessmentHasNoMoreQuestions: true },
      });
    }
  }
}
