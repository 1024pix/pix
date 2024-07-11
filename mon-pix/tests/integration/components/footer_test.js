import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | Footer', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('displays the Pix logo', async function (assert) {
    // when
    const screen = await render(hbs`<Footer />}`);

    // then
    assert.ok(screen.getByAltText(this.intl.t('navigation.homepage')));
  });

  test('displays the navigation menu with expected elements', async function (assert) {
    // when
    const screen = await render(hbs`<Footer />}`);

    // then
    assert.ok(screen.getByRole('link', { name: this.intl.t('navigation.footer.a11y') }));
    assert.ok(screen.getByRole('link', { name: this.intl.t('navigation.footer.data-protection-policy') }));
    assert.ok(screen.getByRole('link', { name: this.intl.t('navigation.footer.eula') }));
    assert.ok(screen.getByRole('link', { name: this.intl.t('navigation.footer.help-center') }));
    assert.ok(screen.getByRole('link', { name: this.intl.t('navigation.footer.legal-notice') }));
    assert.ok(screen.getByRole('link', { name: this.intl.t('navigation.footer.sitemap') }));
  });

  module('when url does not have frenchDomainExtension', function (hooks) {
    hooks.beforeEach(function () {
      class CurrentDomainServiceStub extends Service {
        get isFranceDomain() {
          return false;
        }
      }

      this.owner.register('service:currentDomain', CurrentDomainServiceStub);
    });

    test('does not display marianne logo', async function (assert) {
      // when
      const screen = await render(hbs`<Footer />`);

      // then
      assert.dom(screen.queryByAltText('République française. Liberté, égalité, fraternité.')).doesNotExist();
    });

    test('does not display the student data policy', async function (assert) {
      // when
      const screen = await render(hbs`<Footer />}`);

      // then
      assert.dom(screen.queryByRole('link', { name: 'Politique de protection des données des élèves' })).doesNotExist();
    });
  });

  module('when url does have frenchDomainExtension', function (hooks) {
    hooks.beforeEach(function () {
      class CurrentDomainServiceStub extends Service {
        get isFranceDomain() {
          return true;
        }
      }

      this.owner.register('service:currentDomain', CurrentDomainServiceStub);
    });

    test('displays marianne logo', async function (assert) {
      // when
      const screen = await render(hbs`<Footer />`);

      // then
      assert.dom(screen.getByAltText('République française. Liberté, égalité, fraternité.')).exists();
    });

    test('displays the student data policy', async function (assert) {
      // when
      const screen = await render(hbs`<Footer />}`);

      // then
      assert.dom(screen.getByRole('link', { name: 'Politique de protection des données des élèves' })).exists();
    });
  });
});
