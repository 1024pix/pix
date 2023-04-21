import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import { inject as service } from '@ember/service';
export default class ChallengeRoute extends Route {
  @service router;
  @service store;
  async model() {
    const assessment = await this.modelFor('assessment');
    let challenge;

    try {
      challenge = await this.store.queryRecord('challenge', { assessmentId: assessment.id });
      return RSVP.hash({ assessment, challenge });
    } catch (err) {
      return this.router.replaceWith('assessment.resume', assessment.id, {
        queryParams: { assessmentHasNoMoreQuestions: true },
      });
    }
  }
}
