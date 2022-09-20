import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import EmberObject from '@ember/object';
import sinon from 'sinon';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

describe('Unit | Component | Challenge | Item', function () {
  setupTest();

  describe('answerValidated', function () {
    let createRecordStub;
    let queryRecordStub;
    const challengeOne = EmberObject.create({ id: 'recChallengeOne' });
    const answerValue = 'example';
    let answerToChallengeOne;
    const answerTimeout = false;
    const answerFocusedOut = false;
    const nextChallenge = EmberObject.create({ id: 'recNextChallenge' });

    beforeEach(function () {
      createRecordStub = sinon.stub();
      queryRecordStub = sinon.stub();
      answerToChallengeOne = EmberObject.create({ challenge: challengeOne });
      answerToChallengeOne.save = sinon.stub().resolves();
      answerToChallengeOne.setProperties = sinon.stub();
      answerToChallengeOne.rollbackAttributes = sinon.stub();
    });

    context('when the answer is already known', function () {
      it('should not create a new answer', async function () {
        // given
        const component = createGlimmerComponent('component:challenge/item', { challenge: challengeOne });
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
      });
    });
    context('when no answer was given', function () {
      it('should create an answer', async function () {
        // given
        createRecordStub.returns(answerToChallengeOne);
        queryRecordStub.resolves(nextChallenge);
        const component = createGlimmerComponent('component:challenge/item', { challenge: challengeOne });
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
      });
    });

    it('should update the answer with the timeout', async function () {
      // given
      const assessment = EmberObject.create({ answers: [answerToChallengeOne] });
      createRecordStub.returns(answerToChallengeOne);
      queryRecordStub.resolves(nextChallenge);
      const component = createGlimmerComponent('component:challenge/item', { challenge: challengeOne });
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
    });
    it('should trim the answer value to avoid useless char', async function () {
      // given
      const answerValue = '  exemple \n ';
      const answerValueWithoutUselessChar = 'exemple';
      const assessment = EmberObject.create({ answers: [answerToChallengeOne] });
      createRecordStub.returns(answerToChallengeOne);
      queryRecordStub.resolves(nextChallenge);
      const component = createGlimmerComponent('component:challenge/item', { challenge: challengeOne });
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
    });

    context('when saving succeeds', function () {
      it('should redirect to assessment-resume route', async function () {
        // given
        const assessment = EmberObject.create({ answers: [answerToChallengeOne] });
        const component = createGlimmerComponent('component:challenge/item', { challenge: challengeOne });
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
      });

      context('when user has reached a new level', function () {
        let assessment;
        beforeEach(function () {
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

        it('should redirect to assessment-resume route with level up information', async function () {
          //given
          const component = createGlimmerComponent('component:challenge/item', { challenge: challengeOne });
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
            expectedQueryParams
          );
        });

        it('should redirect to assessment-resume route without level up information when user is anonymous', async function () {
          //given
          const expectedQueryParams = { queryParams: {} };
          const component = createGlimmerComponent('component:challenge/item', { challenge: challengeOne });
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
            expectedQueryParams
          );
        });

        it('should redirect to assessment-resume route without level up information when there is no currentUser', async function () {
          //given
          const expectedQueryParams = { queryParams: {} };
          const component = createGlimmerComponent('component:challenge/item', { challenge: challengeOne });
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
        const assessment = EmberObject.create({ answers: [answerToChallengeOne] });
        const component = createGlimmerComponent('component:challenge/item', { challenge: challengeOne });
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
          });
      });
    });
    context('when assessment has been ended by supervisor', function () {
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
        const component = createGlimmerComponent('component:challenge/item', { challenge: challengeOne });
        const transitionToStub = sinon.stub().returns();
        component.router = { transitionTo: transitionToStub };

        await component.answerValidated(challengeOne, assessment, answerValue, answerFocusedOut, answerTimeout);

        // then
        sinon.assert.calledWithExactly(
          component.router.transitionTo,
          'authenticated.certifications.results',
          assessment.certificationCourse.get('id')
        );
      });
    });
  });
});
