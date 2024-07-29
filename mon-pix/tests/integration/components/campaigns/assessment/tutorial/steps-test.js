import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

module('Integration | Component |  Campaigns::Assessment::Tutorial | Steps', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('on init', function () {
    test('it should display the first step', async function (assert) {
      //  when
      const screen = await render(hbs`<Campaigns::Assessment::Tutorial::Steps @campaignCode='campaignCode' />`);

      // then
      assert.dom(screen.getByText(this.intl.t('pages.tutorial.pages.page0.title'))).exists();
      assert.dom(screen.getByText(this.intl.t('pages.tutorial.pages.page0.explanation').replace('\n', ''))).exists();
      assert.ok(screen.getByRole('presentation').src.endsWith('icn-recherche.svg'));
      assert.strictEqual(screen.getAllByRole('listitem').length, 5);
      assert.dom(screen.getAllByRole('listitem')[0]).hasAttribute('aria-current', 'step');
      assert.dom(screen.getByRole('button', { name: this.intl.t('pages.tutorial.next') })).exists();
      assert.dom(screen.getByRole('button', { name: this.intl.t('pages.tutorial.pass') })).exists();
      assert.dom(screen.queryByRole('button', { name: this.intl.t('pages.tutorial.start') })).doesNotExist();
    });
  });

  module('on next step action', function () {
    test('it should display the next step', async function (assert) {
      //  when
      const screen = await render(hbs`<Campaigns::Assessment::Tutorial::Steps @campaignCode='campaignCode' />`);
      await click(screen.getByRole('button', { name: this.intl.t('pages.tutorial.next') }));

      // then
      assert.dom(screen.getByText(this.intl.t('pages.tutorial.pages.page1.title'))).exists();
      assert.dom(screen.getByText(this.intl.t('pages.tutorial.pages.page1.explanation').replace('\n', ''))).exists();
      assert.ok(screen.getByRole('presentation').src.endsWith('icn-focus.svg'));
      assert.dom(screen.getAllByRole('listitem')[0]).hasNoAttribute('aria-current', 'step');
      assert.dom(screen.getAllByRole('listitem')[1]).hasAttribute('aria-current', 'step');
      assert.dom(screen.getByRole('button', { name: this.intl.t('pages.tutorial.next') })).exists();
      assert.dom(screen.getByRole('button', { name: this.intl.t('pages.tutorial.pass') })).exists();
      assert.dom(screen.queryByRole('button', { name: this.intl.t('pages.tutorial.start') })).doesNotExist();
    });
  });

  module('on last step', function () {
    test('it should display the last step', async function (assert) {
      //  when
      const screen = await render(hbs`<Campaigns::Assessment::Tutorial::Steps @campaignCode='campaignCode' />`);
      await click(
        screen.getByRole('button', {
          name: this.intl.t('pages.tutorial.dot-action-title', { stepNumber: 5, stepsCount: 5 }),
        }),
      );

      // then
      assert.dom(screen.getByText(this.intl.t('pages.tutorial.pages.page4.title'))).exists();
      assert.dom(screen.getByText(this.intl.t('pages.tutorial.pages.page4.explanation').replace('\n', ' '))).exists();
      assert.ok(screen.getByRole('presentation').src.endsWith('icn-algo.svg'));
      assert.dom(screen.getAllByRole('listitem')[4]).hasAttribute('aria-current', 'step');
      assert.dom(screen.queryByRole('button', { name: this.intl.t('pages.tutorial.next') })).doesNotExist();
      assert.dom(screen.queryByRole('button', { name: this.intl.t('pages.tutorial.pass') })).doesNotExist();
      assert.dom(screen.getByRole('button', { name: this.intl.t('pages.tutorial.start') })).exists();
    });
  });
});
