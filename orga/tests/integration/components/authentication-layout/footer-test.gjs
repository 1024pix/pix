import { render } from '@1024pix/ember-testing-library';
import Footer from 'pix-orga/components/authentication-layout/footer';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Authentication-layout | footer', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it displays footer links', async function (assert) {
    // when
    const screen = await render(<template><Footer /></template>);

    // then
    assert.ok(screen.getByRole('navigation'));
  });

  module('when url has org extension', function () {
    test('it displays a locale switcher ', async function (assert) {
      // when
      const screen = await render(<template><Footer /></template>);

      // then
      assert.dom(screen.queryByRole('button', { name: 'Sélectionnez une langue' })).exists();
    });
  });

  module('when url has fr extension', function () {
    test('it displays no locale switcher when url has fr extension', async function (assert) {
      // given
      const domainService = this.owner.lookup('service:currentDomain');
      sinon.stub(domainService, 'getExtension').returns('fr');

      // when
      const screen = await render(<template><Footer /></template>);

      // then
      assert.dom(screen.queryByRole('button', { name: 'Sélectionnez une langue' })).doesNotExist();
    });
  });
});
