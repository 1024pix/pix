import Service from '@ember/service';
import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

import { contains } from '../../helpers/contains';

module('Integration | Component | Footer', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display the Pix logo', async function (assert) {
    // when
    await render(hbs`<Footer />}`);

    // then
    assert.dom(find('.pix-logo__image')).exists();
  });

  test('should display the navigation menu with expected elements', async function (assert) {
    // when
    await render(hbs`<Footer />}`);

    // then
    assert.equal(findAll('.footer-navigation__item').length, 5);
    assert.dom(contains(this.intl.t('navigation.footer.a11y'))).exists();
    assert.dom(contains(this.intl.t('navigation.footer.data-protection-policy'))).exists();
    assert.dom(contains(this.intl.t('navigation.footer.eula'))).exists();
    assert.dom(contains(this.intl.t('navigation.footer.help-center'))).exists();
    assert.dom(contains(this.intl.t('navigation.footer.sitemap'))).exists();
  });

  test('should not display marianne logo when url does not have frenchDomainExtension', async function (assert) {
    // given
    class UrlServiceStub extends Service {
      get isFrenchDomainExtension() {
        return false;
      }
    }
    this.owner.register('service:url', UrlServiceStub);

    // when
    await render(hbs`<Footer />`);

    // then
    assert.dom(find('.footer-logos__french-government')).doesNotExist();
  });

  test('should display marianne logo when url does have frenchDomainExtension', async function (assert) {
    // given
    class UrlServiceStub extends Service {
      get isFrenchDomainExtension() {
        return true;
      }
    }
    this.owner.register('service:url', UrlServiceStub);

    // when
    await render(hbs`<Footer />`);

    // then
    assert.dom(find('.footer-logos__french-government')).exists();
  });
});
