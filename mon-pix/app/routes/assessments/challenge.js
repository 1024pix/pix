import { action } from '@ember/object';
import RSVP from 'rsvp';
import Route from '@ember/routing/route';

export default class ChallengeRoute extends Route {
  async model(params) {
    const store = this.store;

    const assessment = await this.modelFor('assessments');
    await assessment.certificationCourse;
    const challengeId = params.challenge_id;

    return RSVP.hash({
      assessment,
      challenge: store.findRecord('challenge', challengeId),
      answer: store.queryRecord('answer', { assessmentId: assessment.id, challengeId: challengeId }),
    }).catch((err) => {
      const meta = ('errors' in err) ? err.errors.get('firstObject').meta : null;
      if (meta.field === 'authorization') {
        return this.transitionTo('index');
      }
    });
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
  async saveAnswerAndNavigate(challenge, assessment, answerValue, answerTimeout, answerElapsedTime) {
    const answer = this._findOrCreateAnswer(challenge, assessment);
    answer.setProperties({
      value: answerValue.trim(),
      timeout: answerTimeout,
      elapsedTime: answerElapsedTime,
    });

    try {
      await answer.save();

      const levelup = await answer.get('levelup');

      const queryParams = levelup ? {
        queryParams: {
          newLevel: levelup.level,
          competenceLeveled: levelup.competenceName,
        },
      } : { queryParams: {} };

      return this.transitionTo('assessments.resume', assessment.get('id'), queryParams);
    }
    catch (error) {
      answer.rollbackAttributes();

      return this.send('error');
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
