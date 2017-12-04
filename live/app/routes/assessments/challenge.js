import RSVP from 'rsvp';
import BaseRoute from 'pix-live/routes/base-route';

export default BaseRoute.extend({

  model(params) {
    const store = this.get('store');

    const assessmentId = params.assessment_id;
    const challengeId = params.challenge_id;

    return RSVP.hash({
      assessment: store.findRecord('assessment', assessmentId),
      challenge: store.findRecord('challenge', challengeId),
    }).catch((err) => {
      const meta = ('errors' in err) ? err.errors.get('firstObject').meta : null;
      if (meta.field === 'authorization') {
        return this.transitionTo('index');
      }
    });
  },

  afterModel(model) {
    const store = this.get('store');

    // FIXME Quick-win pour contourner la récupération d'un course (qui n'existe pas pour une certif)
    // Correction possible: Séparer la phase de récupération du course et la phase de création d'un assessment
    if (model.assessment.get('type') !== 'CERTIFICATION') {
      return RSVP.hash({
        answers: store.queryRecord('answer', { assessment: model.assessment.id, challenge: model.challenge.id }),
        course: model.assessment.get('course')
      }).then(({ answers, course }) => {
        model.answers = answers;
        model.progress = course.getProgress(model.challenge);
        return model;
      });
    }
  },

  serialize(model) {
    return {
      assessment_id: model.assessment.id,
      challenge_id: model.challenge.id
    };
  },

  _findOrCreateAnswer(challenge, assessment) {
    let answer = assessment.get('answers').findBy('challenge.id', challenge.get('id'));
    if (!answer) {
      answer = this.get('store').createRecord('answer', { assessment, challenge });
    }
    return answer;
  },

  _navigateToNextView(challenge, assessment) {
    return this.get('store')
      .queryRecord('challenge', { assessmentId: assessment.get('id'), challengeId: challenge.get('id') })
      .then((nextChallenge) => this.transitionTo('assessments.challenge', { assessment, challenge: nextChallenge }))
      .catch(() => {
        assessment.get('type') === 'CERTIFICATION' ?
          this.transitionTo('certifications.results')
          : this.transitionTo('assessments.results', assessment.get('id'));
      });
  },

  actions: {

    saveAnswerAndNavigate(challenge, assessment, answerValue, answerTimeout, answerElapsedTime) {
      const answer = this._findOrCreateAnswer(challenge, assessment);
      answer.setProperties({
        value: answerValue,
        timeout: answerTimeout,
        elapsedTime: answerElapsedTime
      });

      return answer.save()
        .then(() => this._navigateToNextView(challenge, assessment));
    }
  }

});
