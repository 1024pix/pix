import { action } from '@ember/object';
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

    let challenge;
    const currentChallengeNumber = parseInt(params.challenge_number);
    const isBackToPreviousChallenge = currentChallengeNumber < assessment.orderedChallengeIdsAnswered.length;
    const hasFastFowarded = currentChallengeNumber > assessment.orderedChallengeIdsAnswered.length;
    if (hasFastFowarded) {
      this.router.replaceWith(`/assessments/${assessment.id}/resume`);
      return;
    }
    let answer = null;
    if (isBackToPreviousChallenge) {
      const challengeId = assessment.orderedChallengeIdsAnswered.at(currentChallengeNumber);
      challenge = await this.store.findRecord('challenge', challengeId);
      answer = await this.store.queryRecord('answer', { assessmentId: assessment.id, challengeId: challenge.id });
    } else {
      if (assessment.isPreview && params.challengeId) {
        challenge = await this.store.findRecord('challenge', params.challengeId);
      } else if (!assessment.isPreview) {
        challenge = assessment.nextChallenge;
      }
    }

    if (!challenge) {
      this.router.transitionTo('assessments.resume', assessment.id);
    }

    // WORKAROUND for PIX-4471 (wrongly displayed focusedout message)
    if (assessment.lastQuestionState === 'focusedout') await assessment.reload();
    if (assessment.isCertification && !challenge.focused) {
      this.focusedCertificationChallengeWarningManager.reset();
    }

    try {
      return {
        assessment,
        challenge,
        answer,
        currentChallengeNumber,
      };
    } catch (err) {
      const meta = 'errors' in err ? err.errors[0].meta : null;
      if (meta.field === 'authorization') {
        this.router.transitionTo('authenticated');
      }
    }
  }

  async afterModel({ assessment }) {
    const campaign = await assessment.campaign;
    if (assessment.isForCampaign && !campaign.isAccessible) {
      this.router.replaceWith('campaigns.archived-error', campaign.code);
      return;
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
