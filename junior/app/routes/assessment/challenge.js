import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { findRecord, query } from '@warp-drive/utilities/json-api';

export default class ChallengeRoute extends Route {
  @service router;
  @service store;
  @service currentLearner;

  async model(params, transition) {
    const assessment = await this.modelFor('assessment');
    const challengeId = transition?.to.queryParams.challengeId;
    if (assessment.type === 'PREVIEW' && challengeId) {
      const { content } = await this.store.request(findRecord('challenge', challengeId));
      const challenge = content.data;
      return { assessment, challenge };
    }
    const { content } = await this.store.request(
      query('challenge', {}, { resourcePath: `assessments/${assessment.id}/next`, reload: true }),
    );
    const challenge = content.data;
    if (challenge == null) {
      return this.router.replaceWith('assessment.resume', assessment.id, {
        queryParams: { assessmentHasNoMoreQuestions: true },
      });
    }
    const { content: activityContent } = await this.store.request(
      query('activity', {}, { resourcePath: `assessments/${assessment.id}/current-activity` }),
    );
    const activity = activityContent.data;
    let oralization = false;
    if (this.currentLearner.learner) {
      const { content } = await this.store.request(findRecord('organization-learner', this.currentLearner.learner.id));
      const organizationLearner = content.data;
      oralization = organizationLearner.hasOralizationFeature;
    }
    return { assessment, challenge, activity, oralization };
  }

  @action
  loading(_transition, _originRoute) {
    // eslint-disable-next-line ember/no-controller-access-in-routes
    const controller = this.controllerFor('assessment.challenge');
    controller.set('currentlyLoading', true);
    return true;
  }
}
