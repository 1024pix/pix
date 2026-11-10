import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import Item from 'mon-pix/components/challenge/item';
import { module, test } from 'qunit';

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
});
