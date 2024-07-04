import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ChallengeRoute extends Route {
  @service router;
  @service store;

  async model(params, transition) {
    const assessment = await this.modelFor('assessment');
    const challengeId = transition?.to.queryParams.challengeId;
    if (assessment.type === 'PREVIEW' && challengeId) {
      const challenge = await this.store.findRecord('challenge', challengeId);
      return { assessment, challenge };
    }
    const challenge = await this.store.queryRecord('challenge', { assessmentId: assessment.id });
    if (challenge == null) {
      return this.router.replaceWith('assessment.resume', assessment.id, {
        queryParams: { assessmentHasNoMoreQuestions: true },
      });
    }
    const activity = await this.store.queryRecord('activity', { assessmentId: assessment.id });
    return { assessment, challenge, activity };
  }

  @action
  loading(_transition, _originRoute) {
    // eslint-disable-next-line ember/no-controller-access-in-routes
    const controller = this.controllerFor('assessment.challenge');
    controller.set('currentlyLoading', true);
    return true;
  }
}
