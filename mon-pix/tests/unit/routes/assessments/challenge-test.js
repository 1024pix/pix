import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import EmberObject from '@ember/object';
import EmberService from '@ember/service';
import sinon from 'sinon';

describe('Unit | Route | Assessments | Challenge', function() {

  setupTest();

  let route;
  let storeStub;
  let createRecordStub;
  let queryRecordStub;
  let findRecordStub;
  const params = {
    challenge_id: 'challenge_id'
  };

  const assessment = {
    id: 'assessment_id',
    get: sinon.stub().callsFake(() => 'ASSESSMENT_TYPE'),
    type: 'PLACEMENT',
  };

  const model = {
    assessment,
    challenge: {
      id: 'challenge_id'
    }
  };

  beforeEach(function() {
    // define stubs
    createRecordStub = sinon.stub();
    queryRecordStub = sinon.stub();
    findRecordStub = sinon.stub();
    storeStub = EmberService.create({
      createRecord: createRecordStub,
      queryRecord: queryRecordStub,
      findRecord: findRecordStub
    });

    route = this.owner.lookup('route:assessments.challenge');
    route.set('store', storeStub);
    route.transitionTo = sinon.stub();
    route.modelFor = sinon.stub().returns(assessment);
  });

  describe('#model', function() {
    it('should correctly call the store to find assessment and challenge', function() {
      // when
      route.model(params);

      // then
      sinon.assert.calledWith(route.modelFor, 'assessments');
      sinon.assert.calledWith(findRecordStub, 'challenge', params.challenge_id);
    });
    it('should call queryRecord to find answer', function() {
      // given
      model.assessment.get.withArgs('isCertification').returns(false);
      model.assessment.get.withArgs('course').returns({ getProgress: sinon.stub().returns('course') });

      // when
      const promise = route.model(params);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(queryRecordStub);
        sinon.assert.calledWith(queryRecordStub, 'answer', {
          assessment: assessment.id,
          challenge: params.challenge_id
        });
      });
    });
  });

  describe('#saveAnswerAndNavigate', function() {
    let answerToChallengeOne;

    let answerValue = 'example';
    const answerTimeout = 120;
    const answerElapsedTime = 65;
    const challengeOne = EmberObject.create({ id: 'recChallengeOne' });
    const nextChallenge = EmberObject.create({ id: 'recNextChallenge' });

    beforeEach(function() {
      answerToChallengeOne = EmberObject.create({ challenge: challengeOne });
      answerToChallengeOne.save = sinon.stub().resolves();
      answerToChallengeOne.setProperties = sinon.stub();
      answerToChallengeOne.rollbackAttributes = sinon.stub();
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

    it('should trim the answer value to avoid useless char', function() {
      // given
      answerValue = '  exemple \n ';
      const answerValueWithoutUselessChar = 'exemple';
      const assessment = EmberObject.create({ answers: [answerToChallengeOne] });
      createRecordStub.returns(answerToChallengeOne);
      queryRecordStub.resolves(nextChallenge);

      // when
      route.actions.saveAnswerAndNavigate.call(route, challengeOne, assessment, answerValue, answerTimeout, answerElapsedTime);

      // then
      sinon.assert.callOrder(answerToChallengeOne.setProperties, answerToChallengeOne.save);
      sinon.assert.calledOnce(answerToChallengeOne.save);
      sinon.assert.calledWith(answerToChallengeOne.setProperties, {
        value: answerValueWithoutUselessChar,
        timeout: answerTimeout,
        elapsedTime: answerElapsedTime
      });
    });

    context('when saving succeeds', function() {
      it('should redirect to assessment-resume route', async function() {
        // given
        const assessment = EmberObject.create({ answers: [answerToChallengeOne] });

        // when
        await route.actions.saveAnswerAndNavigate.call(route, challengeOne, assessment, answerValue, answerTimeout, answerElapsedTime);

        // then
        sinon.assert.calledWithExactly(route.transitionTo, 'assessments.resume', assessment.get('id'), { queryParams: {} });
      });
    });

    context('when saving fails', function() {
      it('should remove temporary answer and send error', async function() {
        // given
        answerToChallengeOne.save = sinon.stub().rejects();
        route.actions.error = sinon.stub().rejects();
        const assessment = EmberObject.create({ answers: [answerToChallengeOne] });

        // when / then
        return route.actions.saveAnswerAndNavigate.call(route, challengeOne, assessment, answerValue, answerTimeout, answerElapsedTime)
          .then(function() {
            throw new Error('was supposed to fail');
          })
          .catch(function() {
            sinon.assert.called(route.actions.error);
            sinon.assert.called(answerToChallengeOne.rollbackAttributes);
          });
      });
    });
  });
});
