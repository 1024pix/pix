import { action } from '@ember/object';
import RSVP from 'rsvp';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ChallengeRoute extends Route {
  @service currentUser;

  async model(params) {
    const assessment = await this.modelFor('assessments');
    await assessment.certificationCourse;
    await assessment.answers;

    let challenge;
    const currentChallengeNumber = parseInt(params.challenge_number);
    const isBackToPreviousChallenge = currentChallengeNumber < assessment.answers.length;
    if (isBackToPreviousChallenge) {
      const answers = assessment.answers.toArray();
      const challengeId = answers[currentChallengeNumber].challenge.get('id');
      challenge = await this.store.findRecord('challenge', challengeId);
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

    return RSVP.hash({
      assessment,
      challenge,
      answer: this.store.queryRecord('answer', { assessmentId: assessment.id, challengeId: challenge.id }),
      currentChallengeNumber,
    }).catch((err) => {
      const meta = 'errors' in err ? err.errors.get('firstObject').meta : null;
      if (meta.field === 'authorization') {
        return this.transitionTo('index');
      }
    });
  }

  async redirect(model) {
    if (!model.challenge) {
      return this.replaceWith('assessments.resume', model.assessment.id, {
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

  _findOrCreateAnswer(challenge, assessment) {
    let answer = assessment.get('answers').findBy('challenge.id', challenge.id);
    if (!answer) {
      answer = this.store.createRecord('answer', { assessment, challenge });
    }
    return answer;
  }

  @action
  async saveAnswerAndNavigate(challenge, assessment, answerValue, answerTimeout, answerFocusedOut) {
    const answer = this._findOrCreateAnswer(challenge, assessment);
    answer.setProperties({
      value: answerValue.trim(),
      timeout: answerTimeout,
      focusedOut: answerFocusedOut,
    });

    try {
      await answer.save();

      let queryParams = { queryParams: {} };
      const levelup = await answer.get('levelup');

      if (this.currentUser.user && !this.currentUser.user.isAnonymous && levelup) {
        queryParams = {
          queryParams: {
            newLevel: levelup.level,
            competenceLeveled: levelup.competenceName,
          },
        };
      }

      this.transitionTo('assessments.resume', assessment.get('id'), queryParams);
    } catch (error) {
      answer.rollbackAttributes();

      if (error?.errors?.[0]?.detail === 'Le surveillant a mis fin à votre test de certification.') {
        return this.transitionTo('certifications.results', assessment.certificationCourse.get('id'));
      }

      return this.intermediateTransitionTo('error', error);
    }
  }

  @action
  resumeAssessment(assessment) {
    return this.transitionTo('assessments.resume', assessment.get('id'));
  }

  @action
  error() {
    return true;
  }
}
