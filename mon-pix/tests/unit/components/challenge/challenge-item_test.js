import EmberObject from '@ember/object';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import createGlimmerComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | Challenge | Item', function (hooks) {
  setupTest(hooks);

  module('#challengeComponent', function () {
    [
      { challengeType: 'QCU', expectedComponent: 'ChallengeItemQcu' },
      { challengeType: 'QCUIMG', expectedComponent: 'ChallengeItemQcu' },
      { challengeType: 'QCM', expectedComponent: 'ChallengeItemQcm' },
      { challengeType: 'QCMIMG', expectedComponent: 'ChallengeItemQcm' },
      { challengeType: 'QROC', expectedComponent: 'ChallengeItemQroc' },
      { challengeType: 'QROCm', expectedComponent: 'ChallengeItemQrocm' },
      { challengeType: 'QROCm-ind', expectedComponent: 'ChallengeItemQrocm' },
      { challengeType: 'QROCm-dep', expectedComponent: 'ChallengeItemQrocm' },
    ].forEach(({ challengeType, expectedComponent }) => {
      test(`should render ${expectedComponent} component when challenge type is ${challengeType}`, function (assert) {
        // given
        const challenge = EmberObject.create({ type: challengeType });
        const answer = EmberObject.create({});

        // when
        const component = createGlimmerComponent('challenge/item', { challenge, answer });

        // then
        assert.strictEqual(component.challengeComponent.name, expectedComponent);
      });
    });
  });

  module('answerValidated', function (hooks) {
    let createRecordStub;
    let queryRecordStub;
    const challengeOne = EmberObject.create({ id: 'recChallengeOne' });
    const answerValue = 'example';
    let answerToChallengeOne;
    const answerTimeout = false;
    const answerFocusedOut = false;
    const nextChallenge = EmberObject.create({ id: 'recNextChallenge' });

    hooks.beforeEach(function () {
      createRecordStub = sinon.stub();
      queryRecordStub = sinon.stub();
      answerToChallengeOne = EmberObject.create({ challenge: challengeOne });
      answerToChallengeOne.save = sinon.stub().resolves();
      answerToChallengeOne.setProperties = sinon.stub();
      answerToChallengeOne.rollbackAttributes = sinon.stub();
    });

    module('when the answer is already known', function () {
      test('should not create a new answer', async function (assert) {
        // given
        const component = createGlimmerComponent('challenge/item', { challenge: challengeOne });
        component.router = { transitionTo: sinon.stub().returns() };
        component.store = {
          createRecord: createRecordStub,
        };
        const assessment = EmberObject.create({ answers: [answerToChallengeOne] });
        assessment.get = sinon.stub().returns({ findBy: sinon.stub().returns(answerToChallengeOne) });
        queryRecordStub.resolves(nextChallenge);

        // when
        await component.answerValidated(challengeOne, assessment, answerValue, answerFocusedOut);

        // then
        sinon.assert.notCalled(createRecordStub);
        assert.ok(true);
      });
    });
    module('when no answer was given', function () {
      test('should create an answer', async function (assert) {
        // given
        createRecordStub.returns(answerToChallengeOne);
        queryRecordStub.resolves(nextChallenge);
        const component = createGlimmerComponent('challenge/item', { challenge: challengeOne });
        component.router = { transitionTo: sinon.stub().returns() };
        component.store = {
          createRecord: createRecordStub,
        };
        const assessment = EmberObject.create({ answers: [] });
        assessment.get = sinon.stub().returns({ findBy: sinon.stub().returns() });
        queryRecordStub.resolves(nextChallenge);

        // when
        await component.answerValidated(challengeOne, assessment, answerValue, answerFocusedOut);

        // then
        sinon.assert.calledWith(createRecordStub, 'answer', {
          assessment: assessment,
          challenge: challengeOne,
        });
        assert.ok(true);
      });
    });

    test('should update the answer with the timeout', async function (assert) {
      // given
      const assessment = EmberObject.create({ answers: [answerToChallengeOne] });
      createRecordStub.returns(answerToChallengeOne);
      queryRecordStub.resolves(nextChallenge);
      const component = createGlimmerComponent('challenge/item', { challenge: challengeOne });
      component.router = { transitionTo: sinon.stub().returns() };
      component.store = {
        createRecord: createRecordStub,
      };
      const answerTimeout = false;

      // when
      await component.answerValidated(challengeOne, assessment, answerValue, answerFocusedOut, answerTimeout);

      // then
      sinon.assert.callOrder(answerToChallengeOne.setProperties, answerToChallengeOne.save);
      sinon.assert.calledOnce(answerToChallengeOne.save);
      sinon.assert.calledWith(answerToChallengeOne.setProperties, {
        value: answerValue,
        timeout: answerTimeout,
        focusedOut: answerFocusedOut,
      });
      assert.ok(true);
    });
    test('should trim the answer value to avoid useless char', async function (assert) {
      // given
      const answerValue = '  exemple \n ';
      const answerValueWithoutUselessChar = 'exemple';
      const assessment = EmberObject.create({ answers: [answerToChallengeOne] });
      createRecordStub.returns(answerToChallengeOne);
      queryRecordStub.resolves(nextChallenge);
      const component = createGlimmerComponent('challenge/item', { challenge: challengeOne });
      component.router = { transitionTo: sinon.stub().returns() };
      component.store = {
        createRecord: createRecordStub,
      };

      // when
      await component.answerValidated(challengeOne, assessment, answerValue, answerFocusedOut, answerTimeout);

      // then
      sinon.assert.callOrder(answerToChallengeOne.setProperties, answerToChallengeOne.save);
      sinon.assert.calledOnce(answerToChallengeOne.save);
      sinon.assert.calledWith(answerToChallengeOne.setProperties, {
        value: answerValueWithoutUselessChar,
        timeout: answerTimeout,
        focusedOut: answerFocusedOut,
      });
      assert.ok(true);
    });

    module('when saving succeeds', function () {
      test('should redirect to assessment-resume route', async function (assert) {
        // given
        const assessment = EmberObject.create({ answers: [answerToChallengeOne] });
        const component = createGlimmerComponent('challenge/item', { challenge: challengeOne });
        component.router = { transitionTo: sinon.stub().returns() };
        component.currentUser = { isAnonymous: false };
        component.store = {
          createRecord: createRecordStub,
        };

        // when
        await component.answerValidated(challengeOne, assessment, answerValue, answerFocusedOut, answerTimeout);

        // then
        sinon.assert.calledWithExactly(component.router.transitionTo, 'assessments.resume', assessment.get('id'), {
          queryParams: {},
        });
        assert.ok(true);
      });

      module('when user has reached a new level', function (hooks) {
        let assessment;
        hooks.beforeEach(function () {
          const answerToChallengeOneWithLevelUp = EmberObject.create({
            challenge: challengeOne,
            levelup: { level: 1, competenceName: 'Me tester' },
          });
          answerToChallengeOneWithLevelUp.save = sinon.stub().resolves();
          answerToChallengeOneWithLevelUp.setProperties = sinon.stub();
          answerToChallengeOneWithLevelUp.rollbackAttributes = sinon.stub();
          createRecordStub.returns(answerToChallengeOneWithLevelUp);
          queryRecordStub.resolves(nextChallenge);
          assessment = EmberObject.create({ answers: [answerToChallengeOneWithLevelUp] });
        });

        test('should redirect to assessment-resume route with level up information', async function (assert) {
          //given
          const component = createGlimmerComponent('challenge/item', { challenge: challengeOne });
          component.router = { transitionTo: sinon.stub().returns() };
          component.currentUser = { user: { isAnonymous: false } };
          component.store = {
            createRecord: createRecordStub,
          };
          const expectedQueryParams = { queryParams: { newLevel: 1, competenceLeveled: 'Me tester' } };

          // when
          await component.answerValidated(challengeOne, assessment, answerValue, answerFocusedOut, answerTimeout);

          // then
          sinon.assert.calledWithExactly(
            component.router.transitionTo,
            'assessments.resume',
            assessment.get('id'),
            expectedQueryParams,
          );
          assert.ok(true);
        });

        test('should redirect to assessment-resume route without level up information when user is anonymous', async function (assert) {
          //given
          const expectedQueryParams = { queryParams: {} };
          const component = createGlimmerComponent('challenge/item', { challenge: challengeOne });
          component.router = { transitionTo: sinon.stub().returns() };
          component.currentUser = { user: { isAnonymous: true } };
          component.store = {
            createRecord: createRecordStub,
          };

          // when
          await component.answerValidated(challengeOne, assessment, answerValue, answerFocusedOut, answerTimeout);

          // then
          sinon.assert.calledWithExactly(
            component.router.transitionTo,
            'assessments.resume',
            assessment.get('id'),
            expectedQueryParams,
          );
          assert.ok(true);
        });

        test('should redirect to assessment-resume route without level up information when there is no currentUser', async function (assert) {
          //given
          const expectedQueryParams = { queryParams: {} };
          const component = createGlimmerComponent('challenge/item', { challenge: challengeOne });
          component.router = { transitionTo: sinon.stub().returns() };
          component.currentUser = { user: undefined };
          component.store = {
            createRecord: createRecordStub,
          };

          // when
          await component.answerValidated(challengeOne, assessment, answerValue, answerFocusedOut, answerTimeout);

          // then
          sinon.assert.calledWithExactly(
            component.router.transitionTo,
            'assessments.resume',
            assessment.get('id'),
            expectedQueryParams,
          );
          assert.ok(true);
        });
      });
    });
    module('when saving fails', function () {
      test('should remove temporary answer and send error', async function (assert) {
        // given
        const error = { message: 'error' };
        answerToChallengeOne.save = sinon.stub().rejects(error);
        const assessment = EmberObject.create({ answers: [answerToChallengeOne] });
        const component = createGlimmerComponent('challenge/item', { challenge: challengeOne });
        const transitionToStub = sinon.stub().returns();
        component.router = { transitionTo: transitionToStub };

        // when / then
        return component.answerValidated
          .call(null, challengeOne, assessment, answerValue, answerFocusedOut, answerTimeout)
          .then(function () {
            throw new Error('was supposed to fail');
          })
          .catch(function () {
            sinon.assert.called(answerToChallengeOne.rollbackAttributes);
            sinon.assert.calledWith(transitionToStub, 'error', error);
            assert.ok(true);
          });
      });
    });
    module('when assessment has been ended by supervisor', function () {
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
        const component = createGlimmerComponent('challenge/item', { challenge: challengeOne });
        const transitionToStub = sinon.stub().returns();
        component.router = { transitionTo: transitionToStub };

        await component.answerValidated(challengeOne, assessment, answerValue, answerFocusedOut, answerTimeout);

        // then
        sinon.assert.calledWithExactly(
          component.router.transitionTo,
          'authenticated.certifications.results',
          assessment.certificationCourse.get('id'),
        );
        assert.ok(true);
      });
    });
  });
});
