import Ember from 'ember';
import DS from 'ember-data';
import getChallengeType from '../../utils/get-challenge-type';
import RSVP from 'rsvp';

export default Ember.Route.extend({

  assessmentService: Ember.inject.service('assessment'),

  model(params) {
    const store = this.get('store');

    const assessmentId = params.assessment_id;
    const challengeId = params.challenge_id;

    const promises = {
      assessment: store.findRecord('assessment', assessmentId),
      challenge: store.findRecord('challenge', challengeId),
      answers: store.queryRecord('answer', { assessment: assessmentId, challenge: challengeId })
    };

    return RSVP.hash(promises).then(results => results);
  },

  actions: {

    saveAnswerAndNavigate: function (currentChallenge, assessment, answerValue) {
      const answer = this._createAnswer(answerValue, currentChallenge, assessment);
      answer.save().then(() => {
        this._navigateToNextView(currentChallenge, assessment);
      });
    }
  },

  _createAnswer: function (answerValue, currentChallenge, assessment) {

    return this.get('store').createRecord('answer', {
      value: answerValue,
      challenge: currentChallenge,
      assessment
    });
  }
  ,

  _urlForNextChallenge: function (adapter, assessmentId, currentChallengeId) {
    return adapter.buildURL('assessment', assessmentId) + '/next/' + currentChallengeId;
  },

  _navigateToNextView: function (currentChallenge, assessment) {

    const adapter = this.get('store').adapterFor('application');
    adapter.ajax(this._urlForNextChallenge(adapter, assessment.get('id'), currentChallenge.get('id')), 'GET')
      .then(nextChallenge => {
        if(nextChallenge) {
          this.transitionTo('assessments.get-challenge', assessment.get('id'), nextChallenge.data.id);
        } else {
          this.transitionTo('assessments.get-results', assessment.get('id'));
        }
      });
  },

  setupController: function (controller, model) {
    this._super(controller, model);

    const progressToSet = model.assessment
      .get('course')
      .then((course) => course.getProgress(model.challenge));

    controller.set('progress', DS.PromiseObject.create({ promise: progressToSet }));

    const challengeType = getChallengeType(model.challenge.get('type'));
    controller.set('challengeItemType', 'challenge-item-' + challengeType);
  }
  ,

  serialize: function (model) {
    return {
      assessment_id: model.assessment.id,
      challenge_id: model.challenge.id
    };
  }

})
;
