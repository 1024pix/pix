import { action } from '@ember/object';
import RSVP from 'rsvp';
import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ChallengeRoute extends Route {
  @service currentUser;
  @service router;
  @service store;
  @service focusedCertificationChallengeWarningManager;

  async model(params) {
    const assessment = await this.modelFor('assessments');
    await assessment.certificationCourse;
    await assessment.answers;

    let challenge;
    const currentChallengeNumber = parseInt(params.challenge_number);
    const isBackToPreviousChallenge = currentChallengeNumber < assessment.answers.length;
    if (isBackToPreviousChallenge) {
      const answers = await assessment.answers;
      challenge = await answers[currentChallengeNumber].challenge;
    } else {
      if (assessment.isPreview && params.challengeId) {
        challenge = await this.store.findRecord('challenge', params.challengeId);
      } else if (!assessment.isPreview) {
        challenge = await this.store.queryRecord('challenge', { assessmentId: assessment.id });
      }
    }

    if (!challenge) {
      return RSVP.hash({
        assessment,
        challenge,
      });
    }

    // WORKAROUND for PIX-4471 (wrongly displayed focusedout message)
    if (assessment.lastQuestionState === 'focusedout') await assessment.reload();
    if (assessment.isCertification && !challenge.focused) {
      this.focusedCertificationChallengeWarningManager.reset();
    }

    return RSVP.hash({
      assessment,
      challenge,
      answer: this.store.queryRecord('answer', { assessmentId: assessment.id, challengeId: challenge.id }),
      currentChallengeNumber,
    }).catch((err) => {
      const meta = 'errors' in err ? err.errors.get('firstObject').meta : null;
      if (meta.field === 'authorization') {
        this.router.transitionTo('authenticated');
        return;
      }
    });
  }

  async redirect(model) {
    if (!model.challenge) {
      return this.router.replaceWith('assessments.resume', model.assessment.id, {
        queryParams: { assessmentHasNoMoreQuestions: true },
      });
    }
  }

  serialize(model) {
    return {
      assessment_id: model.assessment.id,
      challenge_id: model.challenge.id,
    };
  }

  @action
  error() {
    return true;
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('hasFocusedOutOfChallenge', false);
    }
  }
}
