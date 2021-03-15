import { action } from '@ember/object';
import RSVP from 'rsvp';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ChallengeRoute extends Route {
  @service currentUser;

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
  async saveAnswerAndNavigate(challenge, assessment, answerValue, answerTimeout) {
    const answer = this._findOrCreateAnswer(challenge, assessment);
    answer.setProperties({
      value: answerValue.trim(),
      timeout: answerTimeout,
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
