import RSVP from 'rsvp';
import Route from '@ember/routing/route';

export default Route.extend({

  model(params) {
    const store = this.store;

    const assessment = this.modelFor('competence.assessment');
    const challengeId = params.challenge_id;

    return RSVP.hash({
      assessment,
      challenge: store.findRecord('challenge', challengeId),
      answer: store.queryRecord('answer', { assessment: assessment.id, challenge: challengeId })
    });
  },

  _findOrCreateAnswer(challenge, assessment) {
    let answer = assessment.get('answers').findBy('challenge.id', challenge.id);
    if (!answer) {
      answer = this.store.createRecord('answer', { assessment, challenge });
    }
    return answer;
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
        .then(
          () => this.transitionTo('competence.assessment', this.modelFor('competence').competenceId, {
            queryParams: { reloadModel: answer.id }
          }),
          () => {
            answer.rollbackAttributes();
            return this.send('error');
          }
        );
    },
    error() {
      return true;
    }
  }
});
