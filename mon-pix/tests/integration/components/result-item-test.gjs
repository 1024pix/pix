import { render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import { t } from 'ember-intl/test-support';
import ResultItem from 'mon-pix/components/result-item';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | result-item', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when the answer has no displayable result', function () {
    [
      { name: 'undefined answer result', answer: EmberObject.create({ result: undefined }) },
      { name: 'empty answer result', answer: EmberObject.create({ result: '' }) },
      { name: 'null answer result', answer: EmberObject.create({ result: null }) },
    ].forEach(({ name, answer }) => {
      test(`should not render any icon or correction when ${name}`, async function (assert) {
        // when
        const screen = await render(<template><ResultItem @answer={{answer}} /></template>);

        // then
        assert.dom(screen.queryByRole('button')).doesNotExist();
        assert.dom('.result-item__icon').doesNotExist();
      });
    });
  });

  module('when the answer has a displayable result', function () {
    [
      { result: 'ok', expectedColor: 'green', expectedTooltip: 'Réponse correcte' },
      { result: 'ko', expectedColor: 'red', expectedTooltip: 'Réponse incorrecte' },
      { result: 'timedout', expectedColor: 'red', expectedTooltip: 'Temps dépassé' },
      { result: 'aband', expectedColor: 'grey', expectedTooltip: 'Sans réponse' },
    ].forEach(({ result, expectedColor, expectedTooltip }) => {
      test(`should render a ${expectedColor} icon when result is ${result}`, async function (assert) {
        // given
        const answer = EmberObject.create({ result });

        // when
        await render(<template><ResultItem @answer={{answer}} /></template>);

        // then
        assert.dom('.result-item__icon').exists();
        assert.dom(`.result-item__icon--${expectedColor}`).exists();
      });

      test(`should render the tooltip "${expectedTooltip}" when result is ${result}`, async function (assert) {
        // given
        const answer = EmberObject.create({ result });

        // when
        const screen = await render(<template><ResultItem @answer={{answer}} /></template>);

        // then
        assert.dom('.result-item__icon').hasAttribute('title', expectedTooltip);
        assert.dom(screen.getByText(expectedTooltip)).exists();
      });
    });
  });

  module('correction button visibility per challenge type', function () {
    [
      { challengeType: 'QCM', shouldDisplay: true },
      { challengeType: 'QROC', shouldDisplay: true },
      { challengeType: 'QROCM-ind', shouldDisplay: true },
      { challengeType: 'QROCM-dep', shouldDisplay: true },
      { challengeType: 'QCU', shouldDisplay: true },
      { challengeType: 'OtherType', shouldDisplay: false },
    ].forEach(({ challengeType, shouldDisplay }) => {
      test(`should ${shouldDisplay ? 'display' : 'not display'} the correction button when challenge type is ${challengeType}`, async function (assert) {
        // given
        const challenge = EmberObject.create({ type: challengeType });
        const answer = EmberObject.create({ result: 'ok', challenge });

        // when
        const screen = await render(<template><ResultItem @answer={{answer}} /></template>);

        // then
        const button = screen.queryByRole('button', {
          name: t('pages.result-item.actions.see-answers-and-tutorials.label'),
        });
        if (shouldDisplay) {
          assert.dom(button).exists();
        } else {
          assert.dom(button).doesNotExist();
        }
      });
    });

    test('should call openAnswerDetails with the answer when the correction button is clicked', async function (assert) {
      // given
      const challenge = EmberObject.create({ type: 'QCM' });
      const answer = EmberObject.create({ result: 'ok', challenge });
      let openedAnswer = null;
      const openAnswerDetails = (clickedAnswer) => {
        openedAnswer = clickedAnswer;
      };

      const screen = await render(
        <template><ResultItem @answer={{answer}} @openAnswerDetails={{openAnswerDetails}} /></template>,
      );

      // when
      await screen
        .getByRole('button', { name: t('pages.result-item.actions.see-answers-and-tutorials.label') })
        .click();

      // then
      assert.strictEqual(openedAnswer, answer);
    });
  });

  module('instruction truncation depending on viewport width', function () {
    const longInstruction =
      'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam';

    test('should truncate the instruction to 60 characters on mobile', async function (assert) {
      // given
      const initialWidth = window.innerWidth;
      window.innerWidth = 600;
      const challenge = EmberObject.create({ type: 'QCM', instruction: longInstruction });
      const answer = EmberObject.create({ result: 'ok', challenge });

      // when
      await render(<template><ResultItem @answer={{answer}} /></template>);

      // then
      const renderedText = document.querySelector('.result-item__instruction').textContent.trim();
      assert.true(renderedText.length <= 60);
      assert.true(renderedText.endsWith('...'));

      window.innerWidth = initialWidth;
    });

    test('should truncate the instruction to 110 characters on tablet/desktop', async function (assert) {
      // given
      const initialWidth = window.innerWidth;
      window.innerWidth = 1200;
      const challenge = EmberObject.create({ type: 'QCM', instruction: longInstruction });
      const answer = EmberObject.create({ result: 'ok', challenge });

      // when
      await render(<template><ResultItem @answer={{answer}} /></template>);

      // then
      const renderedText = document.querySelector('.result-item__instruction').textContent.trim();
      assert.true(renderedText.length > 60);
      assert.true(renderedText.length <= 110);

      window.innerWidth = initialWidth;
    });
  });
});
