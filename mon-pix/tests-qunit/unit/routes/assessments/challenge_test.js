import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import EmberObject from '@ember/object';
import EmberService from '@ember/service';
import sinon from 'sinon';

module('Unit | Route | Assessments | Challenge', function (hooks) {
  setupTest(hooks);

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

  hooks.beforeEach(function () {
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
    route.router = { transitionTo: sinon.stub() };
    route.modelFor = sinon.stub().returns(assessment);
  });

  module('#model', function () {
    test('should correctly call the store to find assessment and challenge', async function (assert) {
      // when
      await route.model(params);

      // then
      assert.expect(0);
      sinon.assert.calledWith(route.modelFor, 'assessments');
      sinon.assert.calledWith(queryRecordStub, 'challenge', { assessmentId: assessment.id });
    });
    test('should call queryRecord to find answer', async function (assert) {
      // given
      model.assessment.get.withArgs('isCertification').returns(false);
      model.assessment.get.withArgs('course').returns({ getProgress: sinon.stub().returns('course') });

      // when
      await route.model(params);

      // then
      assert.expect(0);
      sinon.assert.calledWith(queryRecordStub, 'answer', {
        assessmentId: assessment.id,
        challengeId: model.challenge.id,
      });
    });
    module('when the assessment is a Preview', async function (hooks) {
      hooks.beforeEach(function () {
        const assessmentForPreview = {
          answers: [],
          type: 'PREVIEW',
          isPreview: true,
        };
        route.modelFor.returns(assessmentForPreview);
      });

      test('should call findRecord to find the asked challenge', async function (assert) {
        // given
        const params = {
          challengeId: 'recId',
          challenge_number: 0,
        };
        storeStub.findRecord.resolves({ id: 'recId' });

        // when
        await route.model(params);

        // then
        assert.expect(0);
        sinon.assert.calledWith(findRecordStub, 'challenge', 'recId');
      });

      test('should not call for next challenge', async function (assert) {
        // given
        const params = {
          challengeId: null,
          challenge_number: 0,
        };

        // when
        await route.model(params);

        // then
        assert.expect(0);
        sinon.assert.notCalled(findRecordStub);
      });
    });

    module('when the asked challenges is already answered', async function (hooks) {
      hooks.beforeEach(function () {
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

      test('should call findRecord to find the asked challenge', async function (assert) {
        // given
        const params = {
          challengeId: 'recId',
          challenge_number: 0,
        };

        // when
        await route.model(params);

        // then
        assert.expect(0);
        sinon.assert.calledWith(findRecordStub, 'challenge', 'oldRecId');
      });
    });
  });

  module('#saveAnswerAndNavigate', function (hooks) {
    let answerToChallengeOne, answerToChallengeOneWithLevelUp;

    let answerValue = 'example';
    const answerTimeout = 120;
    const answerFocusedOut = false;
    const challengeOne = EmberObject.create({ id: 'recChallengeOne' });
    const nextChallenge = EmberObject.create({ id: 'recNextChallenge' });

    hooks.beforeEach(function () {
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

    module('when the answer is already known', function () {
      test('should not create a new answer', function (assert) {
        // given
        const assessment = EmberObject.create({ answers: [answerToChallengeOne] });
        createRecordStub.returns(answerToChallengeOne);
        queryRecordStub.resolves(nextChallenge);

        // when
        route.actions.saveAnswerAndNavigate.call(route, challengeOne, assessment, answerValue, answerTimeout);

        // then
        assert.expect(0);
        sinon.assert.notCalled(createRecordStub);
      });
    });

    module('when no answer was given', function () {
      test('should create an answer', function (assert) {
        // given
        const assessment = EmberObject.create({ answers: [] });
        createRecordStub.returns(answerToChallengeOne);
        queryRecordStub.resolves(nextChallenge);

        // when
        route.actions.saveAnswerAndNavigate.call(route, challengeOne, assessment, answerValue, answerTimeout);

        // then
        assert.expect(0);
        sinon.assert.calledWith(createRecordStub, 'answer', {
          assessment: assessment,
          challenge: challengeOne,
        });
      });
    });

    test('should update the answer with the timeout', function (assert) {
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
      assert.expect(0);
      sinon.assert.callOrder(answerToChallengeOne.setProperties, answerToChallengeOne.save);
      sinon.assert.calledOnce(answerToChallengeOne.save);
      sinon.assert.calledWith(answerToChallengeOne.setProperties, {
        value: answerValue,
        timeout: answerTimeout,
        focusedOut: answerFocusedOut,
      });
    });

    test('should trim the answer value to avoid useless char', function (assert) {
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
      assert.expect(0);
      sinon.assert.callOrder(answerToChallengeOne.setProperties, answerToChallengeOne.save);
      sinon.assert.calledOnce(answerToChallengeOne.save);
      sinon.assert.calledWith(answerToChallengeOne.setProperties, {
        value: answerValueWithoutUselessChar,
        timeout: answerTimeout,
        focusedOut: answerFocusedOut,
      });
    });

    module('when saving succeeds', function () {
      test('should redirect to assessment-resume route', async function (assert) {
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
        assert.expect(0);
        sinon.assert.calledWithExactly(route.router.transitionTo, 'assessments.resume', assessment.get('id'), {
          queryParams: {},
        });
      });

      module('when user has reached a new level', function (hooks) {
        let assessment;
        hooks.beforeEach(function () {
          createRecordStub.returns(answerToChallengeOneWithLevelUp);
          queryRecordStub.resolves(nextChallenge);
          assessment = EmberObject.create({ answers: [answerToChallengeOneWithLevelUp] });
        });

        test('should redirect to assessment-resume route with level up information', async function (assert) {
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
          assert.expect(0);
          sinon.assert.calledWithExactly(
            route.router.transitionTo,
            'assessments.resume',
            assessment.get('id'),
            expectedQueryParams
          );
        });

        test('should redirect to assessment-resume route without level up information when user is anonymous', async function (assert) {
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
          assert.expect(0);
          sinon.assert.calledWithExactly(
            route.router.transitionTo,
            'assessments.resume',
            assessment.get('id'),
            expectedQueryParams
          );
        });

        test('should redirect to assessment-resume route without level up information when there is no currentUser', async function (assert) {
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
          assert.expect(0);
          sinon.assert.calledWithExactly(
            route.router.transitionTo,
            'assessments.resume',
            assessment.get('id'),
            expectedQueryParams
          );
        });
      });
    });

    module('when saving fails', function () {
      test('should remove temporary answer and send error', async function (assert) {
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
            assert.expect(0);
            sinon.assert.called(answerToChallengeOne.rollbackAttributes);
            sinon.assert.calledWith(route.intermediateTransitionTo, 'error', error);
          });
      });
    });

    module('when assessmnt has been ended by supervisor', function () {
      test('should redirect candidate to end test screen when trying to answer', async function (assert) {
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
        assert.expect(0);
        sinon.assert.calledWithExactly(
          route.router.transitionTo,
          'certifications.results',
          assessment.certificationCourse.get('id')
        );
      });
    });
  });
});
