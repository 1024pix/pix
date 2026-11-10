import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click, fillIn } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import ChallengeContent from 'mon-pix/components/challenge/content';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Challenge | Content', function (hooks) {
  setupIntlRenderingTest(hooks);

  const noop = () => {};

  hooks.beforeEach(function () {
    sinon.stub(window, 'fetch');
  });

  hooks.afterEach(function () {
    sinon.restore();
  });

  module('When assessment is of type certification', function (hooks) {
    let screen;

    hooks.beforeEach(async function () {
      // given
      const router = this.owner.lookup('service:router');
      router.transitionTo = sinon.stub();

      const store = this.owner.lookup('service:store');
      const challenge = store.createRecord('challenge', {
        type: 'QROC',
        timer: false,
        format: 'phrase',
        proposals: '${myInput}',
      });
      const answer = null;
      const assessment = store.createRecord('assessment', {
        certificationCourse: store.createRecord('certification-course'),
        type: 'CERTIFICATION',
        answers: [],
      });

      // when
      screen = await render(
        <template>
          <ChallengeContent
            @challenge={{challenge}}
            @answer={{answer}}
            @assessment={{assessment}}
            @hideOutOfFocusBorder={{noop}}
            @showOutOfFocusBorder={{noop}}
            @setFocusedOutOfChallenge={{noop}}
            @resetAllChallengeInfo={{noop}}
          />
        </template>,
      );
    });

    module('on challenge skip', function () {
      test('should disable the live alert button', async function (assert) {
        // then
        await click(screen.getByRole('button', { name: /Signaler un problème avec la question/ }));
        assert.dom(screen.getByRole('button', { name: /Oui, je suis/ })).exists();

        await click(screen.getByRole('button', { name: /Je passe/ }));
        assert
          .dom(screen.getByRole('button', { name: /Signaler un problème avec la question/ }))
          .hasAttribute('aria-disabled');
        assert.dom(screen.queryByRole('button', { name: /Oui, je suis/ })).doesNotExist();
      });
    });

    module('on challenge answering', function () {
      test('should disable the live alert button', async function (assert) {
        // then
        await click(screen.getByRole('button', { name: /Signaler un problème avec la question/ }));
        assert.dom(screen.getByRole('button', { name: /Oui, je suis/ })).exists();

        await fillIn(screen.getByRole('textbox'), 'answer');
        await click(screen.getByRole('button', { name: /Je valide/ }));

        assert
          .dom(screen.getByRole('button', { name: /Signaler un problème avec la question/ }))
          .hasAttribute('aria-disabled');
        assert.dom(screen.queryByRole('button', { name: /Oui, je suis/ })).doesNotExist();
      });
    });
  });

  module('when submitting a challenge', function (hooks) {
    const state = {};
    let createRecordStub;
    let transitionToStub;
    let answer;

    hooks.beforeEach(function () {
      const store = this.owner.lookup('service:store');
      state.challenge = store.createRecord('challenge', {
        id: 'challenge-id',
        type: 'QROC',
        timer: false,
        format: 'phrase',
        proposals: '${myInput}',
      });
      state.assessment = store.createRecord('assessment', {
        id: 'assessment-id',
        type: 'COMPETENCE_EVALUATION',
        orderedChallengeIdsAnswered: [],
        certificationCourse: store.createRecord('certification-course', { id: 'certification-course-id' }),
      });
      state.resetAllChallengeInfo = sinon.stub();
      state.hasFocusedOutOfWindow = false;

      answer = {
        setProperties: sinon.stub(),
        save: sinon.stub().resolves(),
        rollbackAttributes: sinon.stub(),
        get: sinon.stub().resolves(null),
      };
      // Records above are built with the real store; stub createRecord afterwards so
      // the component receives the answer stub instead of a real model.
      createRecordStub = sinon.stub(store, 'createRecord').returns(answer);
      transitionToStub = sinon.stub();

      class RouterStub extends Service {
        transitionTo = transitionToStub;
        on = sinon.stub();
        off = sinon.stub();
      }
      class CurrentUserStub extends Service {
        user = { isAnonymous: false };
      }
      this.owner.register('service:router', RouterStub);
      this.owner.register('service:current-user', CurrentUserStub);
    });

    async function renderContent() {
      return render(
        <template>
          <ChallengeContent
            @challenge={{state.challenge}}
            @answer={{null}}
            @assessment={{state.assessment}}
            @hasFocusedOutOfWindow={{state.hasFocusedOutOfWindow}}
            @hideOutOfFocusBorder={{noop}}
            @showOutOfFocusBorder={{noop}}
            @setFocusedOutOfChallenge={{noop}}
            @resetAllChallengeInfo={{state.resetAllChallengeInfo}}
          />
        </template>,
      );
    }

    async function answerAndValidate() {
      const screen = await renderContent();
      await fillIn(screen.getByRole('textbox'), '  example \n ');
      await click(screen.getByRole('button', { name: t('pages.challenge.actions.validate-go-to-next') }));
      return screen;
    }

    module('when validating an answer', function () {
      test('should create an answer for the challenge and the assessment', async function (assert) {
        // when
        await answerAndValidate();

        // then
        sinon.assert.calledWith(createRecordStub, 'answer', {
          assessment: state.assessment,
          challenge: state.challenge,
        });
        sinon.assert.calledOnce(state.resetAllChallengeInfo);
        assert.ok(true);
      });

      test('should trim the answer value and save it', async function (assert) {
        // when
        await answerAndValidate();

        // then
        sinon.assert.callOrder(answer.setProperties, answer.save);
        sinon.assert.calledWith(answer.setProperties, {
          value: 'example',
          timeout: null,
          focusedOut: false,
        });
        sinon.assert.calledOnce(answer.save);
        assert.ok(true);
      });

      test('should send focusedOut when user has focused out of window', async function (assert) {
        // given
        state.hasFocusedOutOfWindow = true;

        // when
        await answerAndValidate();

        // then
        sinon.assert.calledWithMatch(answer.setProperties, { focusedOut: true });
        assert.ok(true);
      });

      test('should redirect to assessment-resume route when saving succeeds', async function (assert) {
        // when
        await answerAndValidate();

        // then
        assert.deepEqual(state.assessment.orderedChallengeIdsAnswered, ['challenge-id']);
        sinon.assert.calledWithExactly(transitionToStub, 'assessments.resume', 'assessment-id', { queryParams: {} });
      });

      module('when no answer has been given', function () {
        test('should display an error message and not save anything', async function (assert) {
          // given
          const screen = await renderContent();

          // when
          await click(screen.getByRole('button', { name: t('pages.challenge.actions.validate-go-to-next') }));

          // then
          assert.dom(screen.getByText(t('pages.challenge.skip-error-message.qroc'))).exists();
          sinon.assert.notCalled(createRecordStub);
        });
      });

      module('when user has reached a new level', function () {
        test('should redirect with level up information', async function (assert) {
          // given
          answer.get = sinon.stub().resolves({ level: 1, competenceName: 'Me tester' });

          // when
          await answerAndValidate();

          // then
          sinon.assert.calledWithExactly(transitionToStub, 'assessments.resume', 'assessment-id', {
            queryParams: { newLevel: 1, competenceLeveled: 'Me tester' },
          });
          assert.ok(true);
        });

        test('should redirect without level up information when user is anonymous', async function (assert) {
          // given
          answer.get = sinon.stub().resolves({ level: 1, competenceName: 'Me tester' });
          class AnonymousUserStub extends Service {
            user = { isAnonymous: true };
          }
          this.owner.register('service:current-user', AnonymousUserStub);

          // when
          await answerAndValidate();

          // then
          sinon.assert.calledWithExactly(transitionToStub, 'assessments.resume', 'assessment-id', {
            queryParams: {},
          });
          assert.ok(true);
        });
      });

      module('when there is an ongoing live alert', function () {
        test('should not save the answer nor redirect', async function (assert) {
          // given
          state.assessment.hasOngoingChallengeLiveAlert = true;

          // when
          const screen = await renderContent();
          await fillIn(screen.getByRole('textbox'), 'example');
          await click(screen.getByRole('button', { name: t('pages.challenge.actions.validate-go-to-next') }));

          // then
          sinon.assert.notCalled(answer.save);
          sinon.assert.notCalled(transitionToStub);
          assert.ok(true);
        });
      });

      module('when saving fails', function () {
        test('should rollback the answer and redirect to error', async function (assert) {
          // given
          const error = { message: 'error' };
          answer.save = sinon.stub().rejects(error);

          // when
          await answerAndValidate();

          // then
          sinon.assert.called(answer.rollbackAttributes);
          sinon.assert.calledWith(transitionToStub, 'error', error);
          assert.ok(true);
        });
      });

      [
        {
          title: 'when assessment has been ended by invigilator',
          error: { errors: [{ detail: 'Le surveillant a mis fin à votre test de certification.' }] },
        },
        {
          title: 'when assessment has been ended due to session finalization',
          error: { errors: [{ detail: 'La session a été finalisée par votre centre de certification.' }] },
        },
        {
          title: 'when the maximum certification duration has been exceeded',
          error: { errors: [{ code: 'CERTIFICATION_DURATION_EXCEEDED' }] },
        },
      ].forEach(({ title, error }) => {
        module(title, function () {
          test('should redirect to certification results screen', async function (assert) {
            // given
            answer.save = sinon.stub().rejects(error);

            // when
            await answerAndValidate();

            // then
            sinon.assert.calledWithExactly(
              transitionToStub,
              'authenticated.certifications.results',
              'certification-course-id',
            );
            assert.ok(true);
          });
        });
      });
    });

    module('when skipping a challenge', function () {
      test('should save an #ABAND# answer and redirect', async function (assert) {
        // given
        const screen = await renderContent();

        // when
        await click(screen.getByRole('button', { name: t('pages.challenge.actions.skip-go-to-next') }));

        // then
        sinon.assert.calledWith(answer.setProperties, { value: '#ABAND#', timeout: null, focusedOut: false });
        sinon.assert.calledOnce(answer.save);
        sinon.assert.calledOnce(state.resetAllChallengeInfo);
        sinon.assert.calledWithExactly(transitionToStub, 'assessments.resume', 'assessment-id', { queryParams: {} });
        assert.ok(true);
      });
    });

    module('when the challenge is timed', function () {
      test('should send the allotted time as timeout', async function (assert) {
        // given
        state.challenge.timer = 60;

        // when
        const screen = await renderContent();
        await fillIn(screen.getByRole('textbox'), 'example');
        await click(screen.getByRole('button', { name: t('pages.challenge.actions.validate-go-to-next') }));

        // then
        sinon.assert.calledWithMatch(answer.setProperties, { value: 'example', timeout: 60 });
        assert.ok(true);
      });

      test('should display the timeout gauge', async function (assert) {
        // given
        state.challenge.timer = 60;

        // when
        await renderContent();

        // then
        assert.dom('.timeout-gauge').exists();
      });

      module('when the challenge has already timed out', function () {
        test('should send -1 as timeout even without answer', async function (assert) {
          // given
          state.challenge.timer = 60;
          state.assessment.lastQuestionState = 'timeout';

          // when
          const screen = await renderContent();
          await click(screen.getByRole('button', { name: t('pages.challenge.actions.continue-go-to-next') }));

          // then
          sinon.assert.calledWithMatch(answer.setProperties, { timeout: -1 });
          sinon.assert.calledOnce(answer.save);
          assert.ok(true);
        });
      });
    });

    module('focused out notification', function () {
      test('should display the focused out message when user has focused out of window', async function (assert) {
        // given
        state.hasFocusedOutOfWindow = true;

        // when
        const screen = await renderContent();

        // then
        assert.dom(screen.getByText(t('pages.challenge.has-focused-out-of-window.default'))).exists();
      });

      test('should not display the focused out message otherwise', async function (assert) {
        // when
        const screen = await renderContent();

        // then
        assert.dom(screen.queryByText(t('pages.challenge.has-focused-out-of-window.default'))).doesNotExist();
      });
    });
  });
});
