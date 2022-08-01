import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find } from '@ember/test-helpers';
import { render as renderScreen } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import { clickByLabel } from '../../helpers/click-by-label';

module('Integration | Component | Challenge Embed Simulator', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('Acknowledgment overlay', function () {
    test('should be displayed when component has just been rendered', async function (assert) {
      // when
      await render(hbs`<ChallengeEmbedSimulator />`);

      // then
      assert.dom(find('.embed__acknowledgment-overlay')).exists();
    });
  });

  module('Launch simulator button', () => {
    test('should have text "Je lance l\'application"', async function (assert) {
      // when
      const screen = await renderScreen(hbs`<ChallengeEmbedSimulator />`);

      // then
      assert.dom(screen.getByText(this.intl.t('pages.challenge.embed-simulator.actions.launch'))).exists();
    });

    test('should close the acknowledgment overlay when clicked', async function (assert) {
      // given
      await render(hbs`<ChallengeEmbedSimulator />`);

      // when
      await clickByLabel(this.intl.t('pages.challenge.embed-simulator.actions.launch'));

      // then
      assert.dom(find('.embed__acknowledgment-overlay')).doesNotExist();
    });
  });

  module('Reload simulator button', () => {
    test('should have text "Réinitialiser"', async function (assert) {
      // when
      await render(hbs`<ChallengeEmbedSimulator />`);

      // then
      assert.equal(find('.embed__reboot').textContent.trim(), 'Réinitialiser');
    });
  });

  module('Blur effect on simulator panel', function () {
    test('should be active when component is first rendered', async function (assert) {
      // when
      await renderScreen(hbs`<ChallengeEmbedSimulator />`);

      // then
      assert.equal(find('.embed__simulator').classList[1], 'blurred');
    });

    test('should be removed when simulator was launched', async function (assert) {
      // given
      await renderScreen(hbs`<ChallengeEmbedSimulator />`);

      // when
      await clickByLabel(this.intl.t('pages.challenge.embed-simulator.actions.launch'));

      // then
      assert.notEqual(find('.embed__simulator').classList[1], 'blurred');
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
      assert.equal(find('.challenge-embed-simulator').style.cssText, 'height: 200px;');
    });

    test('should define a title attribute on the iframe element that is the one defined in the referential for field "Embed title"', function (assert) {
      assert.equal(find('.embed__iframe').title, 'Embed simulator');
    });

    test('should define a src attribute on the iframe element that is the one defined in the referential for field "Embed URL"', function (assert) {
      assert.equal(find('.embed__iframe').src, 'http://embed-simulator.url/');
    });
  });
});
