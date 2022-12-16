import Service from '@ember/service';
import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import hbs from 'htmlbars-inline-precompile';
import { render } from '@1024pix/ember-testing-library';

module('Integration | Component | Footer', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display the Pix logo', async function (assert) {
    // when
    const screen = await render(hbs`<Footer />}`);

    // then
    assert.ok(screen.getByAltText(this.intl.t('navigation.homepage')));
  });

  test('should display the navigation menu with expected elements', async function (assert) {
    // when
    const screen = await render(hbs`<Footer />}`);

    // then
    assert.ok(screen.getByRole('link', { name: this.intl.t('navigation.footer.a11y') }));
    assert.ok(screen.getByRole('link', { name: this.intl.t('navigation.footer.data-protection-policy') }));
    assert.ok(screen.getByRole('link', { name: this.intl.t('navigation.footer.student-data-protection-policy') }));
    assert.ok(screen.getByRole('link', { name: this.intl.t('navigation.footer.eula') }));
    assert.ok(screen.getByRole('link', { name: this.intl.t('navigation.footer.help-center') }));
    assert.ok(screen.getByRole('link', { name: this.intl.t('navigation.footer.sitemap') }));
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
    const screen = await render(hbs`<Footer />`);

    // then
    assert.notOk(screen.queryByAltText(this.intl.t('common.french-republic')));
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
    const screen = await render(hbs`<Footer />`);

    // then
    assert.ok(screen.getByAltText(this.intl.t('common.french-republic')));
  });

  test('should display the student data policy', async function (assert) {
    // given & when
    const screen = await render(hbs`<Footer />}`);

    // then
    assert.ok(screen.getByRole('link', { name: this.intl.t('navigation.footer.student-data-protection-policy') }));
  });
});
