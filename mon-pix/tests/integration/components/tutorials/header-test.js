import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Tutorials | Header', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    class RouterStub extends Service {
      currentRouteName = 'authenticated.user-tutorials.recommended';
    }
    this.owner.register('service:router', RouterStub);
  });

  test('renders the header', async function (assert) {
    // when
    const screen = await render(hbs`<Tutorials::Header />`);

    // then
    assert.ok(screen.getByRole('heading', { name: this.intl.t('pages.user-tutorials.title') }));
    assert.ok(screen.getByText(this.intl.t('pages.user-tutorials.description')));
    assert.ok(screen.getByRole('link', { name: this.intl.t('pages.user-tutorials.recommended') }));
    assert.ok(screen.getByRole('link', { name: this.intl.t('pages.user-tutorials.saved') }));
  });

  module('when shouldShowFilterButton is true', function () {
    test('should render filter button', async function (assert) {
      // when
      const screen = await render(hbs`<Tutorials::Header @shouldShowFilterButton={{true}} />`);

      // then
      assert.ok(screen.getByRole('button', { name: 'Filtrer' }));
    });
  });

  module('when shouldShowFilterButton is false', function () {
    test('should render filter button', async function (assert) {
      // when
      const screen = await render(hbs`<Tutorials::Header @shouldShowFilterButton={{false}} />`);

      // then
      assert.notOk(screen.queryByRole('button', { name: 'Filtrer' }));
    });
  });
});
