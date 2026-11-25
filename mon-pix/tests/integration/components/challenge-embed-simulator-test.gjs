import { render } from '@1024pix/ember-testing-library';
// eslint-disable-next-line no-restricted-imports
import { click, find } from '@ember/test-helpers';
import ChallengeEmbedSimulator from 'mon-pix/components/challenge-embed-simulator';
import ENV from 'mon-pix/config/environment';
import { t } from 'mon-pix/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | Challenge Embed Simulator', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('Embed simulator', function (hooks) {
    let screen;

    hooks.beforeEach(async function () {
      // given
      const challenge = {
        embedUrl: 'http://embed-simulator.url',
        embedTitle: 'Embed simulator',
        embedHeight: 200,
      };

      // when
      screen = await render(
        <template><ChallengeEmbedSimulator @challenge={{challenge}} @assessmentId="123" /></template>,
      );
    });

    test('should have an height that is the one defined in the referential', function (assert) {
      assert.strictEqual(find('.embed__iframe').style.cssText, 'height: 200px;');
    });

    test('should define a title attribute on the iframe element that is the one defined in the referential for field "Embed title"', function (assert) {
      assert.strictEqual(find('.embed__iframe').title, 'Embed simulator');
    });

    test('should define a src attribute on the iframe element that is the one defined in the referential for field "Embed URL"', function (assert) {
      assert.strictEqual(find('.embed__iframe').src, 'http://embed-simulator.url/');
    });

    module('when embed sends its height', function () {
      test('should listen for embed height and resize iframe container', async function (assert) {
        const event = new MessageEvent('message', {
          data: { from: 'pix', type: 'height', height: 480 },
          origin: 'https://epreuves.pix.fr',
        });
        window.dispatchEvent(event);

        await new Promise((resolve) => setTimeout(resolve, 0));

        assert.strictEqual(find('.embed__iframe').style.cssText, 'height: 480px;');
      });
    });

    module('when embed initializes', function () {
      module('and does not ask for autoLaunch', () => {
        test('should display launch button', async function (assert) {
          const event = new MessageEvent('message', {
            data: { from: 'pix', type: 'init', autoLaunch: false, rebootable: true },
            origin: 'https://epreuves.pix.fr',
          });
          window.dispatchEvent(event);

          await new Promise((resolve) => setTimeout(resolve, 0));

          assert.dom(screen.queryByText(t('pages.challenge.embed-simulator.actions.launch'))).exists();
        });
      });

      module('and asks for autoLaunch', () => {
        test('should not display launch button', async function (assert) {
          const event = new MessageEvent('message', {
            data: { from: 'pix', type: 'init', autoLaunch: true, rebootable: true },
            origin: 'https://epreuves.pix.fr',
          });
          window.dispatchEvent(event);

          await new Promise((resolve) => setTimeout(resolve, 0));

          assert.dom(screen.queryByText(t('pages.challenge.embed-simulator.actions.launch'))).doesNotExist();
        });
      });

      module('and is rebootable', () => {
        test('should display reboot button', async function (assert) {
          const event = new MessageEvent('message', {
            data: { from: 'pix', type: 'init', autoLaunch: false, rebootable: true },
            origin: 'https://epreuves.pix.fr',
          });
          window.dispatchEvent(event);

          await new Promise((resolve) => setTimeout(resolve, 0));

          assert.dom(screen.queryByText(t('pages.challenge.embed-simulator.actions.reset'))).exists();
        });
      });

      module('and is not rebootable', () => {
        test('should not display reboot button', async function (assert) {
          const event = new MessageEvent('message', {
            data: { from: 'pix', type: 'init', autoLaunch: false, rebootable: false },
            origin: 'https://epreuves.pix.fr',
          });
          window.dispatchEvent(event);

          await new Promise((resolve) => setTimeout(resolve, 0));

          assert.dom(screen.queryByText(t('pages.challenge.embed-simulator.actions.reset'))).doesNotExist();
        });
      });

      module('when message data has enableFetchFromApi=true', function () {
        test('should call embed api proxy service', async function (assert) {
          // given
          const requestsPort = new MessageChannel().port1;
          const forwardStub = sinon.stub();
          this.owner.register(
            'service:embed-api-proxy',
            {
              forward: forwardStub,
            },
            { instantiate: false },
          );

          await click(screen.getByText(t('pages.challenge.embed-simulator.actions.launch')));

          // when
          const iframe = screen.getByTitle('Embed simulator');
          const event = new MessageEvent('message', {
            data: { type: 'init', from: 'pix', enableFetchFromApi: true },
            origin: 'https://epreuves.pix.fr',
            source: iframe.contentWindow,
            ports: [requestsPort],
          });
          window.dispatchEvent(event);

          // then
          sinon.assert.calledWith(forwardStub, sinon.match.object, requestsPort, '123', 'assessment');
          assert.ok(true);
        });
      });

      module('when message data has enableFetchFromApi=false', function () {
        test('should not call embed api proxy service', async function (assert) {
          // given
          const forwardStub = sinon.stub();
          this.owner.register(
            'service:embed-api-proxy',
            {
              forward: forwardStub,
            },
            { instantiate: false },
          );

          await click(screen.getByText(t('pages.challenge.embed-simulator.actions.launch')));

          // when
          const iframe = screen.getByTitle('Embed simulator');
          const event = new MessageEvent('message', {
            data: { type: 'init', from: 'pix', enableFetchFromApi: false },
            origin: 'https://epreuves.pix.fr/',
            source: iframe.contentWindow,
          });
          window.dispatchEvent(event);

          // then
          sinon.assert.notCalled(forwardStub);
          assert.ok(true);
        });
      });
    });
  });

  module('allow clipboard-write', function () {
    test('it should allow `clipboard-write` when the embed origin is allowed ', async function (assert) {
      // given
      const challenge = {
        embedUrl: `${ENV.APP.EMBED_ALLOWED_ORIGINS[0]}/embed-simulator.url`,
        embedTitle: 'Embed simulator',
        embedHeight: 200,
      };

      // when
      await render(<template><ChallengeEmbedSimulator @challenge={{challenge}} /></template>);

      // then
      assert.strictEqual(find('.embed__iframe').allow, 'clipboard-write');
    });
    test('it should not allow `clipboard-write` when the embed origin is not allowed', async function (assert) {
      // given
      const challenge = {
        embedUrl: 'http://notAllowedOrigin/embed-simulator.url',
        embedTitle: 'Embed simulator',
        embedHeight: 200,
      };

      // when
      await render(<template><ChallengeEmbedSimulator @challenge={{challenge}} /></template>);

      // then
      assert.notOk(find('.embed__iframe').allow);
    });
  });
});
