import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import EmberObject from '@ember/object';
import EmberService from '@ember/service';
import sinon from 'sinon';

describe('Unit | Route | Assessments | Challenge', function () {
  setupTest();

  let route;
  let storeStub;
  let createRecordStub;
  let queryRecordStub;
  let findRecordStub;
  let currentUserStub;

  const params = {
    challenge_id: 'challenge_id',
  };

  const assessment = {
    id: 'assessment_id',
    get: sinon.stub().callsFake(() => 'ASSESSMENT_TYPE'),
    type: 'PLACEMENT',
    answers: [],
  };

  const model = {
    assessment,
    challenge: {
      id: 'challenge_id',
    },
  };

  beforeEach(function () {
    createRecordStub = sinon.stub();
    queryRecordStub = sinon.stub().resolves(model.challenge);
    findRecordStub = sinon.stub();
    storeStub = EmberService.create({
      createRecord: createRecordStub,
      queryRecord: queryRecordStub,
      findRecord: findRecordStub,
    });

    route = this.owner.lookup('route:assessments.challenge');
    currentUserStub = { user: { firstName: 'John', lastname: 'Doe' } };
    route.currentUser = currentUserStub;
    route.store = storeStub;
    route.transitionTo = sinon.stub();
    route.modelFor = sinon.stub().returns(assessment);
  });

  describe('#model', function () {
    it('should correctly call the store to find assessment and challenge', async function () {
      // when
      await route.model(params);

      // then
      sinon.assert.calledWith(route.modelFor, 'assessments');
      sinon.assert.calledWith(queryRecordStub, 'challenge', { assessmentId: assessment.id });
    });
    it('should call queryRecord to find answer', async function () {
      // given
      model.assessment.get.withArgs('isCertification').returns(false);
      model.assessment.get.withArgs('course').returns({ getProgress: sinon.stub().returns('course') });

      // when
      await route.model(params);

      // then
      sinon.assert.calledWith(queryRecordStub, 'answer', {
        assessmentId: assessment.id,
        challengeId: model.challenge.id,
      });
    });
    context('when the assessment is a Preview', async function () {
      beforeEach(function () {
        const assessmentForPreview = {
          answers: [],
          type: 'PREVIEW',
          isPreview: true,
        };
        route.modelFor.returns(assessmentForPreview);
      });

      it('should call findRecord to find the asked challenge', async function () {
        // given
        const params = {
          challengeId: 'recId',
          challenge_number: 0,
        };
        storeStub.findRecord.resolves({ id: 'recId' });

        // when
        await route.model(params);

        // then
        sinon.assert.calledWith(findRecordStub, 'challenge', 'recId');
      });

      it('should not call for next challenge', async function () {
        // given
        const params = {
          challengeId: null,
          challenge_number: 0,
        };

        // when
        await route.model(params);

        // then
        sinon.assert.notCalled(findRecordStub);
      });
    });

    context('when the asked challenges is already answered', async function () {
      beforeEach(function () {
        const assessmentWithAnswers = {
          answers: [
            {
              id: 3,
              challenge: {
                id: 'oldRecId',
                get: () => 'oldRecId',
              },
            },
          ],
          type: 'COMPETENCE',
        };
        route.modelFor.returns(assessmentWithAnswers);
        storeStub.findRecord.resolves({ id: 'recId' });
      });

      it('should call findRecord to find the asked challenge', async function () {
        // given
        const params = {
          challengeId: 'recId',
          challenge_number: 0,
        };

        // when
        await route.model(params);

        // then
        sinon.assert.calledWith(findRecordStub, 'challenge', 'oldRecId');
      });
    });
  });

  describe('#saveAnswerAndNavigate', function () {
    let answerToChallengeOne, answerToChallengeOneWithLevelUp;

    let answerValue = 'example';
    const answerTimeout = 120;
    const answerFocusedOut = false;
    const challengeOne = EmberObject.create({ id: 'recChallengeOne' });
    const nextChallenge = EmberObject.create({ id: 'recNextChallenge' });

    beforeEach(function () {
      answerToChallengeOne = EmberObject.create({ challenge: challengeOne });
      answerToChallengeOne.save = sinon.stub().resolves();
      answerToChallengeOne.setProperties = sinon.stub();
      answerToChallengeOne.rollbackAttributes = sinon.stub();

      answerToChallengeOneWithLevelUp = EmberObject.create({
        challenge: challengeOne,
        levelup: { level: 1, competenceName: 'Me tester' },
      });
      answerToChallengeOneWithLevelUp.save = sinon.stub().resolves();
      answerToChallengeOneWithLevelUp.setProperties = sinon.stub();
      answerToChallengeOneWithLevelUp.rollbackAttributes = sinon.stub();
    });

    context('when the answer is already known', function () {
      it('should not create a new answer', function () {
        // given
        const assessment = EmberObject.create({ answers: [answerToChallengeOne] });
        createRecordStub.returns(answerToChallengeOne);
        queryRecordStub.resolves(nextChallenge);

        // when
        route.actions.saveAnswerAndNavigate.call(route, challengeOne, assessment, answerValue, answerTimeout);

        // then
        sinon.assert.notCalled(createRecordStub);
      });
    });

    context('when no answer was given', function () {
      it('should create an answer', function () {
        // given
        const assessment = EmberObject.create({ answers: [] });
        createRecordStub.returns(answerToChallengeOne);
        queryRecordStub.resolves(nextChallenge);

        // when
        route.actions.saveAnswerAndNavigate.call(route, challengeOne, assessment, answerValue, answerTimeout);

        // then
        sinon.assert.calledWith(createRecordStub, 'answer', {
          assessment: assessment,
          challenge: challengeOne,
        });
      });
    });

    it('should update the answer with the timeout', function () {
      // given
      const assessment = EmberObject.create({ answers: [answerToChallengeOne] });
      createRecordStub.returns(answerToChallengeOne);
      queryRecordStub.resolves(nextChallenge);

      // when
      route.actions.saveAnswerAndNavigate.call(
        route,
        challengeOne,
        assessment,
        answerValue,
        answerTimeout,
        answerFocusedOut
      );

      // then
      sinon.assert.callOrder(answerToChallengeOne.setProperties, answerToChallengeOne.save);
      sinon.assert.calledOnce(answerToChallengeOne.save);
      sinon.assert.calledWith(answerToChallengeOne.setProperties, {
        value: answerValue,
        timeout: answerTimeout,
        focusedOut: answerFocusedOut,
      });
    });

    it('should trim the answer value to avoid useless char', function () {
      // given
      answerValue = '  exemple \n ';
      const answerValueWithoutUselessChar = 'exemple';
      const assessment = EmberObject.create({ answers: [answerToChallengeOne] });
      createRecordStub.returns(answerToChallengeOne);
      queryRecordStub.resolves(nextChallenge);

      // when
      route.actions.saveAnswerAndNavigate.call(
        route,
        challengeOne,
        assessment,
        answerValue,
        answerTimeout,
        answerFocusedOut
      );

      // then
      sinon.assert.callOrder(answerToChallengeOne.setProperties, answerToChallengeOne.save);
      sinon.assert.calledOnce(answerToChallengeOne.save);
      sinon.assert.calledWith(answerToChallengeOne.setProperties, {
        value: answerValueWithoutUselessChar,
        timeout: answerTimeout,
        focusedOut: answerFocusedOut,
      });
    });

    context('when saving succeeds', function () {
      it('should redirect to assessment-resume route', async function () {
        // given
        currentUserStub.isAnonymous = false;
        route.currentUser = currentUserStub;
        const assessment = EmberObject.create({ answers: [answerToChallengeOne] });

        // when
        await route.actions.saveAnswerAndNavigate.call(
          route,
          challengeOne,
          assessment,
          answerValue,
          answerTimeout,
          answerFocusedOut
        );

        // then
        sinon.assert.calledWithExactly(route.transitionTo, 'assessments.resume', assessment.get('id'), {
          queryParams: {},
        });
      });

      context('when user has reached a new level', function () {
        let assessment;
        beforeEach(function () {
          createRecordStub.returns(answerToChallengeOneWithLevelUp);
          queryRecordStub.resolves(nextChallenge);
          assessment = EmberObject.create({ answers: [answerToChallengeOneWithLevelUp] });
        });

        it('should redirect to assessment-resume route with level up information', async function () {
          //given
          currentUserStub.user.isAnonymous = false;
          route.currentUser = currentUserStub;
          const expectedQueryParams = {
            queryParams: {
              newLevel: answerToChallengeOneWithLevelUp.levelup.level,
              competenceLeveled: answerToChallengeOneWithLevelUp.levelup.competenceName,
            },
          };

          // when
          await route.actions.saveAnswerAndNavigate.call(
            route,
            challengeOne,
            assessment,
            answerValue,
            answerTimeout,
            answerFocusedOut
          );

          // then
          sinon.assert.calledWithExactly(
            route.transitionTo,
            'assessments.resume',
            assessment.get('id'),
            expectedQueryParams
          );
        });

        it('should redirect to assessment-resume route without level up information when user is anonymous', async function () {
          //given
          currentUserStub.user.isAnonymous = true;
          route.currentUser = currentUserStub;
          const expectedQueryParams = { queryParams: {} };

          // when
          await route.actions.saveAnswerAndNavigate.call(
            route,
            challengeOne,
            assessment,
            answerValue,
            answerTimeout,
            answerFocusedOut
          );

          // then
          sinon.assert.calledWithExactly(
            route.transitionTo,
            'assessments.resume',
            assessment.get('id'),
            expectedQueryParams
          );
        });

        it('should redirect to assessment-resume route without level up information when there is no currentUser', async function () {
          //given
          route.currentUser = { user: undefined };
          const expectedQueryParams = { queryParams: {} };

          // when
          await route.actions.saveAnswerAndNavigate.call(
            route,
            challengeOne,
            assessment,
            answerValue,
            answerTimeout,
            answerFocusedOut
          );

          // then
          sinon.assert.calledWithExactly(
            route.transitionTo,
            'assessments.resume',
            assessment.get('id'),
            expectedQueryParams
          );
        });
      });
    });

    context('when saving fails', function () {
      it('should remove temporary answer and send error', async function () {
        // given
        const error = { message: 'error' };
        answerToChallengeOne.save = sinon.stub().rejects(error);
        route.intermediateTransitionTo = sinon.stub().rejects();
        const assessment = EmberObject.create({ answers: [answerToChallengeOne] });

        // when / then
        return route.actions.saveAnswerAndNavigate
          .call(route, challengeOne, assessment, answerValue, answerTimeout)
          .then(function () {
            throw new Error('was supposed to fail');
          })
          .catch(function () {
            sinon.assert.called(answerToChallengeOne.rollbackAttributes);
            sinon.assert.calledWith(route.intermediateTransitionTo, 'error', error);
          });
      });
    });

    context('when assessmnt has been ended by supervisor', function () {
      it('should redirect candidate to end test screen when trying to answer', async function () {
        // given
        const error = {
          errors: [
            {
              detail: 'Le surveillant a mis fin à votre test de certification.',
            },
          ],
        };
        answerToChallengeOne.save = sinon.stub().rejects(error);
        const certificationCourse = EmberObject.create({});
        const assessment = EmberObject.create({ answers: [answerToChallengeOne], certificationCourse });

        // when
        await route.actions.saveAnswerAndNavigate.call(
          route,
          challengeOne,
          assessment,
          answerValue,
          answerTimeout,
          answerFocusedOut
        );

        // then
        sinon.assert.calledWithExactly(
          route.transitionTo,
          'certifications.results',
          assessment.certificationCourse.get('id')
        );
      });
    });
  });
});
