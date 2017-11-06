import RSVP from 'rsvp';
import BaseRoute from 'pix-live/routes/base-route';

export default BaseRoute.extend({

  model(params) {
    const store = this.get('store');

    const { assessment_id: assessmentId } = this.paramsFor('assessments');
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
    const answers = store.queryRecord('answer', {
      assessment: model.assessment.id,
      challenge: model.challenge.id
    });
    const course = model.assessment.get('course');
    return RSVP.all([answers, course]).then(values => {
      model.progress = values[1].getProgress(model.challenge);
      model.answers = answers;
      model.course = course;
      return model;
    });
  },

  serialize(model) {
    return {
      assessment_id: model.assessment.id,
      challenge_id: model.challenge.id
    };
  },

  _findOrCreateAnswer(challenge, assessment) {
    let answer = assessment.get('answers').findBy('challenge.id', challenge.id);
    if (!answer) {
      answer = this.get('store').createRecord('answer', { assessment, challenge });
    }
    return answer;
  },

  _navigateToNextView(challenge, assessment) {
    const store = this.get('store');
    const challengeAdapter = store.adapterFor('challenge');

    return challengeAdapter.queryNext(store, assessment.id, challenge.id)
      .then(nextChallenge => {
        if (nextChallenge) {
          return this.transitionTo('assessments.challenge', { assessment, challenge: nextChallenge });
        }
        return this.transitionTo('assessments.results', assessment);
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
        .then(() => this._navigateToNextView(challenge, assessment))
        .catch((err) => {
          alert(`Erreur lors de l’enregistrement de la réponse : ${err}`);
          return err;
        });
    }
  },

});
