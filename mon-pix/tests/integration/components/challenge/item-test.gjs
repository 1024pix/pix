import { render } from '@1024pix/ember-testing-library';
import { fillIn } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import Item from 'mon-pix/components/challenge/item';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Challenge | Item', function (hooks) {
  setupIntlRenderingTest(hooks);

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

  module('timeout gauge', function (hooks) {
    let challenge, assessment;

    hooks.beforeEach(function () {
      const store = this.owner.lookup('service:store');
      challenge = store.createRecord('challenge', {
        type: 'QROC',
        timer: 60,
        format: 'phrase',
        proposals: '${myInput}',
      });
      assessment = store.createRecord('assessment', {});
    });

    test('should display the timeout gauge when displayTimer is true', async function (assert) {
      // when
      await render(
        <template>
          <Item @challenge={{challenge}} @answer={{null}} @assessment={{assessment}} @displayTimer={{true}} />
        </template>,
      );

      // then
      assert.dom('.timeout-gauge').exists();
    });

    test('should not display the timeout gauge when displayTimer is false', async function (assert) {
      // when
      await render(
        <template>
          <Item @challenge={{challenge}} @answer={{null}} @assessment={{assessment}} @displayTimer={{false}} />
        </template>,
      );

      // then
      assert.dom('.timeout-gauge').doesNotExist();
    });
  });

  module('when user answers', function () {
    test('should forward the answer value and error state to the parent', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const challenge = store.createRecord('challenge', {
        type: 'QROC',
        timer: false,
        format: 'phrase',
        proposals: '${myInput}',
      });
      const assessment = store.createRecord('assessment', {});
      const setAnswerValue = sinon.stub();
      const setAnswerError = sinon.stub();

      // when
      const screen = await render(
        <template>
          <Item
            @challenge={{challenge}}
            @answer={{null}}
            @assessment={{assessment}}
            @setAnswerValue={{setAnswerValue}}
            @setAnswerError={{setAnswerError}}
          />
        </template>,
      );
      await fillIn(screen.getByRole('textbox'), 'example');

      // then
      sinon.assert.calledWith(setAnswerValue, 'example');
      sinon.assert.calledWith(setAnswerError, false);
      assert.ok(true);
    });

    test('should display the error message when displayErrorMessage is true', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const challenge = store.createRecord('challenge', {
        type: 'QROC',
        timer: false,
        format: 'phrase',
        proposals: '${myInput}',
      });
      const assessment = store.createRecord('assessment', {});

      // when
      const screen = await render(
        <template>
          <Item @challenge={{challenge}} @answer={{null}} @assessment={{assessment}} @displayErrorMessage={{true}} />
        </template>,
      );

      // then
      assert.dom(screen.getByText(t('pages.challenge.skip-error-message.qroc'))).exists();
    });
  });
});
