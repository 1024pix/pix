import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click, fillIn } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import Item from 'mon-pix/components/challenge/item';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Challenge | Item', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should render', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const challenge = store.createRecord('challenge', {
      type: 'QROC',
      timer: false,
      format: 'phrase',
      proposals: '${myInput}',
    });
    const answer = {};

    // when
    await render(<template><Item @challenge={{challenge}} @answer={{answer}} /></template>);

    // then
    assert.dom('.challenge-item').exists();
  });

  module('challenge component selection', function () {
    [
      { challengeType: 'QCU', instructionKey: 'pages.challenge.parts.answer-instructions.qcu' },
      { challengeType: 'QCUIMG', instructionKey: 'pages.challenge.parts.answer-instructions.qcu' },
      { challengeType: 'QCM', instructionKey: 'pages.challenge.parts.answer-instructions.qcm' },
      { challengeType: 'QCMIMG', instructionKey: 'pages.challenge.parts.answer-instructions.qcm' },
    ].forEach(({ challengeType, instructionKey }) => {
      test(`should render the proper proposals when challenge type is ${challengeType}`, async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const challenge = store.createRecord('challenge', {
          type: challengeType,
          timer: false,
          proposals: '- prop 1\n- prop 2',
        });
        const assessment = store.createRecord('assessment', {});
        const answer = null;

        // when
        const screen = await render(
          <template><Item @challenge={{challenge}} @answer={{answer}} @assessment={{assessment}} /></template>,
        );

        // then
        assert.dom(screen.getByText(t(instructionKey))).exists();
      });
    });

    ['QROC', 'QROCm', 'QROCm-ind', 'QROCm-dep'].forEach((challengeType) => {
      test(`should render a text input when challenge type is ${challengeType}`, async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const challenge = store.createRecord('challenge', {
          type: challengeType,
          timer: false,
          format: 'phrase',
          proposals: '${myInput}',
        });
        const assessment = store.createRecord('assessment', {});
        const answer = null;

        // when
        const screen = await render(
          <template><Item @challenge={{challenge}} @answer={{answer}} @assessment={{assessment}} /></template>,
        );

        // then
        assert.dom(screen.getByRole('textbox')).exists();
        assert.dom(screen.queryByText(t('pages.challenge.parts.answer-instructions.qcu'))).doesNotExist();
        assert.dom(screen.queryByText(t('pages.challenge.parts.answer-instructions.qcm'))).doesNotExist();
      });
    });
  });

  module('when validating an answer', function (hooks) {
    const state = {};
    let createRecordStub;
    let transitionToStub;
    let answer;

    hooks.beforeEach(function () {
      const store = this.owner.lookup('service:store');
      state.challenge = store.createRecord('challenge', {
        type: 'QROC',
        timer: false,
        format: 'phrase',
        proposals: '${myInput}',
      });
      state.assessment = {
        hasOngoingChallengeLiveAlert: false,
        orderedChallengeIdsAnswered: [],
        get: () => 'assessment-id',
      };

      answer = {
        setProperties: sinon.stub(),
        save: sinon.stub().resolves(),
        rollbackAttributes: sinon.stub(),
        get: sinon.stub().resolves(null),
      };
      // The challenge above is built with the real store; stub createRecord afterwards so
      // the component receives the answer stub instead of a real model (and avoids WarpDrive
      // trying to normalize the plain assessment object as a relationship).
      createRecordStub = sinon.stub(store, 'createRecord').returns(answer);
      transitionToStub = sinon.stub();
      state.onChallengeSubmitStub = sinon.stub();

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

    hooks.afterEach(function () {
      sinon.restore();
    });

    async function renderItem() {
      const noop = () => {};
      const screen = await render(
        <template>
          <Item
            @challenge={{state.challenge}}
            @answer={{null}}
            @assessment={{state.assessment}}
            @onChallengeSubmit={{state.onChallengeSubmitStub}}
            @resetAllChallengeInfo={{noop}}
          />
        </template>,
      );
      await fillIn(screen.getByRole('textbox'), '  example \n ');
      await click(screen.getByRole('button', { name: t('pages.challenge.actions.validate-go-to-next') }));
      return screen;
    }

    test('should create an answer and submit the challenge', async function (assert) {
      // when
      await renderItem();

      // then
      sinon.assert.calledOnce(state.onChallengeSubmitStub);
      sinon.assert.calledWith(createRecordStub, 'answer', { assessment: state.assessment, challenge: state.challenge });
      assert.ok(true);
    });

    test('should trim the answer value and save it', async function (assert) {
      // when
      await renderItem();

      // then
      sinon.assert.callOrder(answer.setProperties, answer.save);
      sinon.assert.calledWith(answer.setProperties, {
        value: 'example',
        timeout: null,
        focusedOut: undefined,
      });
      sinon.assert.calledOnce(answer.save);
      assert.ok(true);
    });

    test('should redirect to assessment-resume route when saving succeeds', async function (assert) {
      // when
      await renderItem();

      // then
      sinon.assert.calledWithExactly(transitionToStub, 'assessments.resume', 'assessment-id', { queryParams: {} });
      assert.ok(true);
    });

    module('when user has reached a new level', function () {
      test('should redirect with level up information', async function (assert) {
        // given
        answer.get = sinon.stub().resolves({ level: 1, competenceName: 'Me tester' });

        // when
        await renderItem();

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
        await renderItem();

        // then
        sinon.assert.calledWithExactly(transitionToStub, 'assessments.resume', 'assessment-id', { queryParams: {} });
        assert.ok(true);
      });
    });

    module('when there is an ongoing live alert', function () {
      test('should not save the answer nor redirect', async function (assert) {
        // given
        state.assessment.hasOngoingChallengeLiveAlert = true;

        // when
        await renderItem();

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
        await renderItem();

        // then
        sinon.assert.called(answer.rollbackAttributes);
        sinon.assert.calledWith(transitionToStub, 'error', error);
        assert.ok(true);
      });
    });

    module('when assessment has been ended by invigilator', function () {
      test('should redirect to certification results screen', async function (assert) {
        // given
        const error = { errors: [{ detail: 'Le surveillant a mis fin à votre test de certification.' }] };
        answer.save = sinon.stub().rejects(error);
        state.assessment.certificationCourse = { get: () => 'certification-course-id' };

        // when
        await renderItem();

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
