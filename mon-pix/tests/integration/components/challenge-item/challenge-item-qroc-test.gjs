import { clickByName, render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import ChallengeItemQroc from 'mon-pix/components/challenge-item/challenge-item-qroc';
import ENV from 'mon-pix/config/environment';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Challenge item QROC', function (hooks) {
  setupIntlRenderingTest(hooks);

  const state = {};

  hooks.beforeEach(function () {
    state.assessment = {
      hasTimeoutChallenge: false,
    };
  });

  test('should render the form', async function (assert) {
    const challenge = {
      timer: false,
    };
    const answer = null;

    await render(
      <template>
        <ChallengeItemQroc @challenge={{challenge}} @answer={{answer}} @assessment={{state.assessment}} />
      </template>,
    );

    assert.dom('.qroc-proposal').exists();
  });

  module('When format is a paragraph', function () {
    test('should display a textarea', async function (assert) {
      // given
      const challenge = {
        timer: false,
        format: 'paragraphe',
        proposals: 'mon label: ${myInput}',
      };
      const answer = {};

      // when
      const screen = await render(
        <template>
          <ChallengeItemQroc @challenge={{challenge}} @answer={{answer}} @assessment={{state.assessment}} />
        </template>,
      );

      // then
      assert.dom(screen.getByRole('textbox', { name: 'mon label:' })).exists();
    });
  });

  module('When format is a sentence', function () {
    test('should display an input', async function (assert) {
      // given
      const challenge = {
        timer: false,
        format: 'phrase',
        proposals: 'mon label: ${myInput}',
      };
      const answer = {};

      // when
      const screen = await render(
        <template>
          <ChallengeItemQroc @challenge={{challenge}} @answer={{answer}} @assessment={{state.assessment}} />
        </template>,
      );

      // then
      assert.dom(screen.getByRole('textbox', { name: 'mon label:' })).exists();
      assert.dom(screen.getByRole('textbox', { name: 'mon label:' })).hasAttribute('type', 'text');
    });
  });

  module('When format is a number', function () {
    test('should display an input with number type', async function (assert) {
      // given
      const challenge = {
        timer: false,
        format: 'nombre',
        proposals: 'mon label: ${myInput}',
      };
      const answer = {};

      // when
      const screen = await render(
        <template>
          <ChallengeItemQroc @challenge={{challenge}} @answer={{answer}} @assessment={{state.assessment}} />
        </template>,
      );

      // then
      assert.dom(screen.getByRole('spinbutton', { name: 'mon label:' })).exists();
      assert.dom(screen.getByRole('spinbutton', { name: 'mon label:' })).hasAttribute('type', 'number');
    });
  });

  module('When format is neither a paragraph nor a phrase', function () {
    [
      { format: 'petit', expectedSize: '11' },
      { format: 'mots', expectedSize: '20' },
      { format: 'unreferenced_format', expectedSize: '20' },
    ].forEach((data) => {
      test(`should display an input with expected size (${data.expectedSize}) when format is ${data.format}`, async function (assert) {
        // given
        const challenge = {
          timer: false,
          format: data.format,
          proposals: 'mon label: ${myInput}',
        };
        const answer = {};

        // when
        const screen = await render(
          <template>
            <ChallengeItemQroc @challenge={{challenge}} @answer={{answer}} @assessment={{state.assessment}} />
          </template>,
        );

        // then
        assert.dom(screen.getByRole('textbox', { name: 'mon label:' })).exists();
        assert.dom(screen.getByRole('textbox', { name: 'mon label:' })).hasAttribute('size', data.expectedSize);
      });
    });
  });

  module('Whatever the format', function () {
    [
      { format: 'mots', cssClass: '.challenge-response__proposal', inputType: 'input' },
      { format: 'phrase', cssClass: '.challenge-response__proposal--sentence', inputType: 'input' },
      { format: 'paragraphe', cssClass: '.challenge-response__proposal--paragraph', inputType: 'textarea' },
      { format: 'unreferenced_format', cssClass: '.challenge-response__proposal', inputType: 'input' },
    ].forEach((data) => {
      module(`Component behavior when the user clicks on the ${data.inputType}:`, function () {
        test('should not display autocompletion answers', async function (assert) {
          // given
          const challenge = {
            timer: false,
            format: data.format,
            proposals: 'mon label: ${myInput}',
          };
          const answer = { value: '' };

          // when
          const screen = await render(
            <template>
              <ChallengeItemQroc @challenge={{challenge}} @answer={{answer}} @assessment={{state.assessment}} />
            </template>,
          );

          // then
          assert.dom(screen.getByRole('textbox', { name: 'mon label:' })).hasAttribute('autocomplete', 'nope');
        });
      });

      module('Component behavior when user fill input of challenge:', function () {
        test('should display a value when a non-empty value is providing by user', async function (assert) {
          // given
          const challenge = {
            timer: false,
            format: data.format,
            proposals: 'mon label: ${myInput}',
          };
          const answer = { value: 'myValue' };

          // when
          const screen = await render(
            <template>
              <ChallengeItemQroc @challenge={{challenge}} @answer={{answer}} @assessment={{state.assessment}} />
            </template>,
          );

          // then
          assert.strictEqual(screen.getByRole('textbox', { name: 'mon label:' }).value, 'myValue');
        });
      });

      module('Component behavior when user skip challenge:', function () {
        [
          { input: 'aband', output: 'aband' },
          { input: '#aband#', output: '#aband#' },
          { input: 'aband#', output: 'aband#' },
          { input: 'ABAND', output: 'ABAND' },
          { input: '#ABAND', output: '#ABAND' },
          { input: 'ABAND#', output: 'ABAND#' },
          { input: '#ABAND#', output: '' },
          { input: '', output: '' },
        ].forEach(({ input, output }) => {
          test(`should display '' value ${input} is providing to component`, async function (assert) {
            // given
            const challenge = {
              timer: false,
              format: data.format,
              proposals: 'mon label: ${myInput}',
            };
            const answer = { value: input };

            // when
            const screen = await render(
              <template>
                <ChallengeItemQroc @challenge={{challenge}} @answer={{answer}} @assessment={{state.assessment}} />
              </template>,
            );

            // then
            assert.strictEqual(screen.getByRole('textbox', { name: 'mon label:' }).value, output);
          });
        });
      });
    });
  });

  module('when default value is defined in proposals', function () {
    test('should prefill input with default value', async function (assert) {
      // given
      const challenge = {
        timer: false,
        format: 'mots',
        proposals: 'mon label: ${myInput value="c\'est prérempli !!!"}',
      };
      const answer = {};

      // when
      const screen = await render(
        <template>
          <ChallengeItemQroc @challenge={{challenge}} @answer={{answer}} @assessment={{state.assessment}} />
        </template>,
      );

      // then
      assert.strictEqual(screen.getByRole('textbox', { name: 'mon label:' }).value, "c'est prérempli !!!");
    });

    test('should prefill number input with default value', async function (assert) {
      // given
      const challenge = {
        timer: false,
        format: 'nombre',
        proposals: 'mon label: ${myInput value=42}',
      };
      const answer = {};

      // when
      const screen = await render(
        <template>
          <ChallengeItemQroc @challenge={{challenge}} @answer={{answer}} @assessment={{state.assessment}} />
        </template>,
      );

      // then
      assert.strictEqual(screen.getByRole('spinbutton', { name: 'mon label:' }).value, '42');
    });
  });

  module('when the challenge is an auto-reply embed', function (hooks) {
    const originalEmbedAllowedOrigins = ENV.APP.EMBED_ALLOWED_ORIGINS;

    const embedState = {};

    hooks.beforeEach(function () {
      ENV.APP.EMBED_ALLOWED_ORIGINS = [
        'https://epreuves.pix.fr',
        'https://1024pix.github.io',
        'https://*.review.pix.fr',
      ];
      embedState.challenge = {
        autoReply: true,
        id: 'rec_123',
        timer: false,
      };
      embedState.answerValidated = sinon.stub().resolves();
      embedState.resetAllChallengeInfo = sinon.stub();
    });

    hooks.afterEach(function () {
      ENV.APP.EMBED_ALLOWED_ORIGINS = originalEmbedAllowedOrigins;
    });

    test('should not display the proposal', async function (assert) {
      // when
      const screen = await render(
        <template>
          <ChallengeItemQroc
            @challenge={{embedState.challenge}}
            @answer={{null}}
            @assessment={{state.assessment}}
            @answerValidated={{embedState.answerValidated}}
            @resetAllChallengeInfo={{embedState.resetAllChallengeInfo}}
          />
        </template>,
      );

      // then
      assert.dom('.qroc-proposal').doesNotExist();
      assert.strictEqual(screen.queryByRole('textbox'), null);
    });

    module('when the event message is from Pix', function () {
      [
        {
          title: 'a string from an allowed origin',
          event: { data: 'magicWord', origin: 'https://epreuves.pix.fr' },
          expectedAnswer: 'magicWord',
        },
        {
          title: 'a JSON string from an allowed origin',
          event: { data: '{ "answer": "magicWord", "from": "pix"}', origin: 'https://epreuves.pix.fr' },
          expectedAnswer: 'magicWord',
        },
        {
          title: 'a numeric string from an allowed origin',
          event: { data: '2', origin: 'https://epreuves.pix.fr' },
          expectedAnswer: '2',
        },
        {
          title: 'an object from an allowed origin',
          event: { data: { answer: 'magicWord', from: 'pix' }, origin: 'https://epreuves.pix.fr' },
          expectedAnswer: 'magicWord',
        },
        {
          title: 'an object from the preview origin',
          event: { data: { answer: 'magicWord', from: 'pix' }, origin: 'https://1024pix.github.io' },
          expectedAnswer: 'magicWord',
        },
        {
          title: 'an object from an origin allowed via a wildcard',
          event: { data: { answer: 'magicWord', from: 'pix' }, origin: 'https://test-pr14.review.pix.fr' },
          expectedAnswer: 'magicWord',
        },
      ].forEach(({ title, event, expectedAnswer }) => {
        test(`should set the auto-reply answer from ${title}`, async function (assert) {
          // given
          await render(
            <template>
              <ChallengeItemQroc
                @challenge={{embedState.challenge}}
                @answer={{null}}
                @assessment={{state.assessment}}
                @answerValidated={{embedState.answerValidated}}
                @resetAllChallengeInfo={{embedState.resetAllChallengeInfo}}
              />
            </template>,
          );

          // when
          window.dispatchEvent(new MessageEvent('message', event));
          await clickByName(t('pages.challenge.actions.validate-go-to-next'));

          // then
          assert.true(embedState.answerValidated.calledOnce);
          assert.strictEqual(embedState.answerValidated.firstCall.args[2], expectedAnswer);
        });
      });
    });

    module('when the event message is not from Pix', function () {
      [
        {
          title: 'the origin is not allowed',
          event: { data: { answer: 'magicWord', from: 'pix' }, origin: 'https://epreuves.fake.fr' },
        },
        {
          title: 'the data object does not come from pix',
          event: { data: { answer: 'magicWord' }, origin: 'https://epreuves.fake.fr' },
        },
      ].forEach(({ title, event }) => {
        test(`should not set the auto-reply answer when ${title}`, async function (assert) {
          // given
          const screen = await render(
            <template>
              <ChallengeItemQroc
                @challenge={{embedState.challenge}}
                @answer={{null}}
                @assessment={{state.assessment}}
                @answerValidated={{embedState.answerValidated}}
                @resetAllChallengeInfo={{embedState.resetAllChallengeInfo}}
              />
            </template>,
          );

          // when
          window.dispatchEvent(new MessageEvent('message', event));
          await clickByName(t('pages.challenge.actions.validate-go-to-next'));

          // then
          assert.true(embedState.answerValidated.notCalled);
          assert.dom(screen.getByText(t('pages.challenge.skip-error-message.qroc-auto-reply'))).exists();
        });
      });
    });
  });
});
