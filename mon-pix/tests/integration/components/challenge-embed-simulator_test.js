import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { render } from '@1024pix/ember-testing-library';

module('Integration | Component | Challenge Embed Simulator', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('Launch simulator button', function () {
    test('should have text "Je lance l\'application"', async function (assert) {
      // when
      const screen = await render(hbs`<ChallengeEmbedSimulator />`);

      // then
      assert.ok(screen.getByText(this.intl.t('pages.challenge.embed-simulator.actions.launch')));
    });

    test('should close the acknowledgment overlay when clicked', async function (assert) {
      // given
      this.set('embedDocument', {
        url: 'http://embed-simulator.url',
        title: 'Embed simulator',
        height: 200,
      });

      // when
      const screen = await render(hbs`<ChallengeEmbedSimulator @embedDocument={{this.embedDocument}} />`);

      // when
      await click(screen.getByText(this.intl.t('pages.challenge.embed-simulator.actions.launch')));

      // then
      assert.dom(screen.queryByText(this.intl.t('pages.challenge.embed-simulator.actions.launch'))).doesNotExist();
    });
  });

  module('Reload simulator button', function () {
    test('should have text "Réinitialiser"', async function (assert) {
      // given
      this.set('embedDocument', {
        url: 'http://embed-simulator.url',
        title: 'Embed simulator',
        height: 200,
      });

      // when
      const screen = await render(hbs`<ChallengeEmbedSimulator @embedDocument={{this.embedDocument}} />`);

      // then
      assert.dom(screen.queryByText('Réinitialiser')).exists();
    });
  });

  module('Blur effect on simulator panel', function () {
    test('should be active when component is first rendered', async function (assert) {
      // given
      this.set('embedDocument', {
        url: 'http://embed-simulator.url',
        title: 'Embed simulator',
        height: 200,
      });

      // when
      await render(hbs`<ChallengeEmbedSimulator @embedDocument={{this.embedDocument}} />`);

      // then
      assert.dom('[data-test-id="embed-simulator"]').hasClass('blurred');
    });

    test('should be removed when simulator was launched', async function (assert) {
      // given
      await render(hbs`<ChallengeEmbedSimulator />`);

      // when
      await click(screen.getByText(this.intl.t('pages.challenge.embed-simulator.actions.launch')));

      // then
      assert.dom('[data-test-id="embed-simulator"]').doesNotHaveClass('blurred');
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
    });

    test('should have an height that is the one defined in the referential', async function (assert) {
      // when
      await render(hbs`<ChallengeEmbedSimulator @embedDocument={{this.embedDocument}} />`);

      // then
      assert.dom('[data-test-id="challenge-embed-simulator"]').hasStyle({ height: '200px' });
    });

    test('should define a title attribute on the iframe element that is the one defined in the referential for field "Embed title"', async function (assert) {
      // when
      await render(hbs`<ChallengeEmbedSimulator @embedDocument={{this.embedDocument}} />`);

      // then
      assert.dom('[data-test-id="embed-iframe"]').hasAttribute('title', 'Embed simulator');
    });

    test('should define a src attribute on the iframe element that is the one defined in the referential for field "Embed URL"', async function (assert) {
      // when
      await render(hbs`<ChallengeEmbedSimulator @embedDocument={{this.embedDocument}} />`);

      // then
      assert.dom('[data-test-id="embed-iframe"]').hasAttribute('src', 'http://embed-simulator.url');
    });
  });
});
