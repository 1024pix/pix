import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import EmberObject from '@ember/object';
import EmberService from '@ember/service';
import sinon from 'sinon';

describe('Unit | Route | Assessments.ChallengeRoute', function() {
  setupTest('route:assessments.challenge', {
    needs: ['service:current-routed-modal', 'service:session']
  });

  let route;
  let StoreStub;
  let createRecordStub;
  let queryRecordStub;
  let findRecordStub;
  const params = {
    assessment_id: 'assessment_id',
    challenge_id: 'challenge_id'
  };

  const model = {
    assessment: {
      id: 'assessment_id',
      get: sinon.stub()
    },
    challenge: {
      id: 'challenge_id'
    }
  };
  const userId = 'user_id';
  beforeEach(function() {
    // define stubs
    createRecordStub = sinon.stub();
    queryRecordStub = sinon.stub();
    findRecordStub = sinon.stub();
    findRecordStub.withArgs('user', userId).resolves({ userId });
    StoreStub = EmberService.extend({
      createRecord: createRecordStub,
      queryRecord: queryRecordStub,
      findRecord: findRecordStub
    });

    // manage dependency injection context
    this.register('service:store', StoreStub);
    this.inject.service('store', { as: 'store' });
    this.register('service:session', EmberService.extend({
      data: { authenticated: { userId: userId, token: 'VALID-TOKEN' } }
    }));
    // instance route object
    route = this.subject();
    route.transitionTo = sinon.stub();
  });

  it('exists', function() {
    expect(route).to.be.ok;
  });

  describe('#model', function() {
    it('should correctly call the store to find assessment and challenge', function() {
      // when
      route.model(params);

      // then
      sinon.assert.calledTwice(findRecordStub);
      sinon.assert.calledWith(findRecordStub, 'assessment', params.assessment_id);
      sinon.assert.calledWith(findRecordStub, 'challenge', params.challenge_id);
    });
  });

  describe('#afterModel', function() {
    it('should call queryRecord to find answer', function() {
      // given
      model.assessment.get.withArgs('isCertification').returns(false);
      model.assessment.get.withArgs('course').returns({ getProgress: sinon.stub().returns('course') });

      // when
      const promise = route.afterModel(model);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(queryRecordStub);
        sinon.assert.calledWith(queryRecordStub, 'answer', { assessment : model.assessment.id, challenge: model.challenge.id });
      });
    });

    it('should call findRecord for user if assessment is certification', function() {
      // given
      model.assessment.get.withArgs('isCertification').returns(true);
      model.assessment.get.withArgs('course').returns({ getProgress: sinon.stub().returns('course') });

      // when
      const promise = route.afterModel(model);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(findRecordStub);
        sinon.assert.calledWith(findRecordStub, 'user', userId);
      });
    });

    it('should not call findRecord for user if assessement is not a certification', function() {
      // given
      model.assessment.get.withArgs('isCertification').returns(false);
      model.assessment.get.withArgs('course').returns({ getProgress: sinon.stub().returns('course') });

      // when
      const promise = route.afterModel(model);

      // then
      return promise.then(() => {
        sinon.assert.notCalled(findRecordStub);
      });
    });

    it('should return a complete model', function() {
      // given
      model.assessment.get.withArgs('isCertification').returns(true);
      model.assessment.get.withArgs('course').returns({ getProgress: sinon.stub().returns('course') });
      const expectedModel = {
        assessment: { id: 'assessment_id' },
        challenge: { id: 'challenge_id' },
        progress: 'course',
        user: { userId: userId },
        courseId: 'course_id'
      };

      // when
      const promise = route.afterModel(model);

      // then
      return promise.then((createdModel) => {
        expect(createdModel.toString()).to.equal(expectedModel.toString());
      });
    });
  });

  describe('#saveAnswerAndNavigate', function() {
    let answerToChallengeOne;

    const answerValue = '';
    const answerTimeout = 120;
    const answerElapsedTime = 65;
    const challengeOne = EmberObject.create({ id: 'recChallengeOne' });
    const nextChallenge = EmberObject.create({ id: 'recNextChallenge' });

    beforeEach(function() {
      answerToChallengeOne = EmberObject.create({ challenge: challengeOne });
      answerToChallengeOne.save = sinon.stub().resolves();
      answerToChallengeOne.setProperties = sinon.stub();
    });

    context('when the answer is already known', function() {
      it('should not create a new answer', function() {
        // given
        const assessment = EmberObject.create({ answers: [answerToChallengeOne] });
        createRecordStub.returns(answerToChallengeOne);
        queryRecordStub.resolves(nextChallenge);

        // when
        route.actions.saveAnswerAndNavigate.call(route, challengeOne, assessment, answerValue, answerTimeout, answerElapsedTime);

        // then
        sinon.assert.notCalled(createRecordStub);
      });
    });

    context('when no answer was given', function() {
      it('should create an answer', function() {
        // given
        const assessment = EmberObject.create({ answers: [] });
        createRecordStub.returns(answerToChallengeOne);
        queryRecordStub.resolves(nextChallenge);

        // when
        route.actions.saveAnswerAndNavigate.call(route, challengeOne, assessment, answerValue, answerTimeout, answerElapsedTime);

        // then
        sinon.assert.calledWith(createRecordStub, 'answer', {
          assessment: assessment,
          challenge: challengeOne
        });
      });
    });

    it('should update the answer with the timeout and elapsedTime', function() {
      // given
      const assessment = EmberObject.create({ answers: [answerToChallengeOne] });
      createRecordStub.returns(answerToChallengeOne);
      queryRecordStub.resolves(nextChallenge);

      // when
      route.actions.saveAnswerAndNavigate.call(route, challengeOne, assessment, answerValue, answerTimeout, answerElapsedTime);

      // then
      sinon.assert.callOrder(answerToChallengeOne.setProperties, answerToChallengeOne.save);
      sinon.assert.calledOnce(answerToChallengeOne.save);
      sinon.assert.calledWith(answerToChallengeOne.setProperties, {
        value: answerValue,
        timeout: answerTimeout,
        elapsedTime: answerElapsedTime
      });
    });

    context('when the next challenge exists', function() {
      it('should redirect to the challenge view', function() {
        // given
        const assessment = EmberObject.create({ answers: [answerToChallengeOne] });
        createRecordStub.returns(answerToChallengeOne);
        queryRecordStub.resolves(nextChallenge);

        // when
        const promise = route.actions.saveAnswerAndNavigate.call(route, challengeOne, assessment, answerValue, answerTimeout, answerElapsedTime);

        // then
        return promise.then(function() {
          sinon.assert.callOrder(answerToChallengeOne.save, route.transitionTo);
          sinon.assert.calledWith(route.transitionTo, 'assessments.challenge', {
            assessment: assessment,
            challenge: nextChallenge
          });
        });
      });
    });

    context('when the next challenge does not exist (is null)', function() {
      context('when the assessment is a certification', function() {
        it('should redirect to the certification end page', function() {
          // given
          const assessment = EmberObject.create({ type: 'CERTIFICATION', answers: [answerToChallengeOne] });
          createRecordStub.returns(answerToChallengeOne);
          queryRecordStub.rejects();

          // when
          const promise = route.actions.saveAnswerAndNavigate.call(route, challengeOne, assessment, answerValue, answerTimeout, answerElapsedTime);

          // then
          return promise.then(function() {
            sinon.assert.callOrder(answerToChallengeOne.save, route.transitionTo);
            sinon.assert.calledWith(route.transitionTo, 'certifications.results');
          });
        });
      });

      context('when the assessment is not certification', function() {
        it('should redirect to the assessment results page', function() {
          // given
          const assessment = EmberObject.create({ answers: [answerToChallengeOne] });
          createRecordStub.returns(answerToChallengeOne);
          queryRecordStub.rejects();

          // when
          const promise = route.actions.saveAnswerAndNavigate.call(route, challengeOne, assessment, answerValue, answerTimeout, answerElapsedTime);

          // then
          return promise.then(function() {
            sinon.assert.callOrder(answerToChallengeOne.save, route.transitionTo);
            sinon.assert.calledWith(route.transitionTo, 'assessments.results', assessment.get('id'));
          });
        });
      });
    });

  });
});
