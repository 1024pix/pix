import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { clickByLabel } from '../../helpers/click-by-label';
import { render } from '@1024pix/ember-testing-library';

module('Integration | Component | Challenge Embed Simulator', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('Acknowledgment overlay', function () {
    test('should be displayed when component has just been rendered', async function (assert) {
      // when
      await render(hbs`<ChallengeEmbedSimulator />`);

      // then
      assert.dom('.embed__acknowledgment-overlay').exists();
    });
  });

  module('Launch simulator button', function () {
    test('should have text "Je lance l\'application"', async function (assert) {
      // when
      const screen = await render(hbs`<ChallengeEmbedSimulator />`);

      // then
      assert.ok(screen.getByText(this.intl.t('pages.challenge.embed-simulator.actions.launch')));
    });

    test('should close the acknowledgment overlay when clicked', async function (assert) {
      // given
      await render(hbs`<ChallengeEmbedSimulator />`);

      // when
      await clickByLabel(this.intl.t('pages.challenge.embed-simulator.actions.launch'));

      // then
      assert.dom('.embed__acknowledgment-overlay').doesNotExist();
    });
  });

  module('Reload simulator button', function () {
    test('should have text "Réinitialiser"', async function (assert) {
      // when
      await render(hbs`<ChallengeEmbedSimulator />`);

      // then
      assert.strictEqual(find('.embed__reboot').textContent.trim(), 'Réinitialiser');
    });
  });

  module('Blur effect on simulator panel', function () {
    test('should be active when component is first rendered', async function (assert) {
      // when
      await render(hbs`<ChallengeEmbedSimulator />`);

      // then
      assert.true(find('.embed__simulator').classList.contains('blurred'));
    });

    test('should be removed when simulator was launched', async function (assert) {
      // given
      await render(hbs`<ChallengeEmbedSimulator />`);

      // when
      await clickByLabel(this.intl.t('pages.challenge.embed-simulator.actions.launch'));

      // then
      assert.false(find('.embed__simulator').classList.contains('blurred'));
    });
  });

  module('Embed simulator', function (hooks) {
    hooks.beforeEach(async function () {
      // given
      this.set('embedDocument', {
        url: 'http://embed-simulator.url',
        title: 'Embed simulator',
        height: 200,
      });

      // when
      await render(hbs`<ChallengeEmbedSimulator @embedDocument={{this.embedDocument}} />`);

      // then
    });

    test('should have an height that is the one defined in the referential', function (assert) {
      assert.strictEqual(find('.challenge-embed-simulator').style.cssText, 'height: 200px;');
    });

    test('should define a title attribute on the iframe element that is the one defined in the referential for field "Embed title"', function (assert) {
      assert.strictEqual(find('.embed__iframe').title, 'Embed simulator');
    });

    test('should define a src attribute on the iframe element that is the one defined in the referential for field "Embed URL"', function (assert) {
      assert.strictEqual(find('.embed__iframe').src, 'http://embed-simulator.url/');
    });
  });
});
