import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ChallengeRoute extends Route {
  @service router;
  @service store;

  async model(params, transition) {
    const assessment = await this.modelFor('assessment');
    try {
      const challengeId = transition?.to.queryParams.challengeId;
      if (assessment.type === 'PREVIEW' && challengeId) {
        const challenge = await this.store.findRecord('challenge', challengeId);
        return { assessment, challenge };
      }
      const challenge = await this.store.queryRecord('challenge', { assessmentId: assessment.id });
      const activity = await this.store.queryRecord('activity', { assessmentId: assessment.id });
      return { assessment, challenge, activity };
    } catch (err) {
      //TODO manage error instead of says it's the end...
      return this.router.replaceWith('assessment.resume', assessment.id, {
        queryParams: { assessmentHasNoMoreQuestions: true },
      });
    }
  }
}
