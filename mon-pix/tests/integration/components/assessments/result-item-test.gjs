import { render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import { t } from 'ember-intl/test-support';
import ResultItem from 'mon-pix/components/assessments/result-item';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

const CORRECTION_BUTTON_LABEL = 'pages.result-item.actions.see-answers-and-tutorials.label';

module('Integration | Component | Assessments | result-item', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when the answer has no displayable result', function () {
    [
      { name: 'undefined answer result', result: undefined },
      { name: 'empty answer result', result: '' },
      { name: 'null answer result', result: null },
    ].forEach(({ name, result }) => {
      test(`should render nothing when ${name}`, async function (assert) {
        // given
        const answer = EmberObject.create({ result, challenge: EmberObject.create({ type: 'QCM' }) });

        // when
        const screen = await render(<template><ResultItem @answer={{answer}} /></template>);

        // then
        assert.dom(screen.queryByRole('button')).doesNotExist();
        assert.dom(screen.queryByTitle(t('pages.comparison-window.results.ok.tooltip'))).doesNotExist();
      });
    });
  });

  module('when the answer has a displayable result', function () {
    ['ok', 'ko', 'timedout', 'aband'].forEach((result) => {
      test(`should display the result status when result is ${result}`, async function (assert) {
        // given
        const answer = EmberObject.create({ result });
        const expectedTooltip = t(`pages.comparison-window.results.${result}.tooltip`);

        // when
        const screen = await render(<template><ResultItem @answer={{answer}} /></template>);

        // then
        assert.dom(screen.getByTitle(expectedTooltip)).exists();
        assert.dom(screen.getByText(expectedTooltip)).exists();
      });
    });

    test('should display the challenge instruction without its markdown', async function (assert) {
      // given
      const challenge = EmberObject.create({
        type: 'QCM',
        instruction: "Un QCM propose plusieurs choix, l'utilisateur peut en choisir [plusieurs](http://link.url)",
      });
      const answer = EmberObject.create({ result: 'ko', challenge });

      // when
      const screen = await render(<template><ResultItem @answer={{answer}} /></template>);

      // then
      assert.dom(screen.getByText("Un QCM propose plusieurs choix, l'utilisateur peut en choisir plusieurs")).exists();
    });
  });

  module('correction button', function () {
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
        const button = screen.queryByRole('button', { name: t(CORRECTION_BUTTON_LABEL) });
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
      await screen.getByRole('button', { name: t(CORRECTION_BUTTON_LABEL) }).click();

      // then
      assert.strictEqual(openedAnswer, answer);
    });
  });

  module('instruction truncation depending on viewport width', function (hooks) {
    const longInstruction =
      'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam';
    const startsWithInstruction = (content) => content.trim().startsWith('Lorem ipsum dolor');
    let initialWidth;

    hooks.beforeEach(function () {
      initialWidth = window.innerWidth;
    });

    hooks.afterEach(function () {
      window.innerWidth = initialWidth;
    });

    test('should truncate the instruction to 60 characters on mobile', async function (assert) {
      // given
      window.innerWidth = 600;
      const challenge = EmberObject.create({ type: 'QCM', instruction: longInstruction });
      const answer = EmberObject.create({ result: 'ok', challenge });

      // when
      const screen = await render(<template><ResultItem @answer={{answer}} /></template>);

      // then
      const renderedText = screen.getByText(startsWithInstruction).textContent.trim();
      assert.true(renderedText.length <= 60);
      assert.true(renderedText.endsWith('...'));
    });

    test('should truncate the instruction to 110 characters on tablet/desktop', async function (assert) {
      // given
      window.innerWidth = 1200;
      const challenge = EmberObject.create({ type: 'QCM', instruction: longInstruction });
      const answer = EmberObject.create({ result: 'ok', challenge });

      // when
      const screen = await render(<template><ResultItem @answer={{answer}} /></template>);

      // then
      const renderedText = screen.getByText(startsWithInstruction).textContent.trim();
      assert.true(renderedText.length > 60);
      assert.true(renderedText.length <= 110);
    });
  });
});
