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
    assert.ok(screen.getByRole('link', { name: this.intl.t('navigation.footer.student-data-protection-policy') }));
    assert.ok(screen.getByRole('link', { name: this.intl.t('navigation.footer.eula') }));
    assert.ok(screen.getByRole('link', { name: this.intl.t('navigation.footer.help-center') }));
    assert.ok(screen.getByRole('link', { name: this.intl.t('navigation.footer.sitemap') }));
  });

  test('does not display marianne logo when url does not have frenchDomainExtension', async function (assert) {
    // given
    class CurrentDomainServiceStub extends Service {
      get isFranceDomain() {
        return false;
      }
    }
    this.owner.register('service:currentDomain', CurrentDomainServiceStub);

    // when
    const screen = await render(hbs`<Footer />`);

    // then
    assert.notOk(screen.queryByAltText(this.intl.t('common.french-republic')));
  });

  test('displays marianne logo when url does have frenchDomainExtension', async function (assert) {
    // given
    class CurrentDomainServiceStub extends Service {
      get isFranceDomain() {
        return true;
      }
    }
    this.owner.register('service:currentDomain', CurrentDomainServiceStub);

    // when
    const screen = await render(hbs`<Footer />`);

    // then
    assert.ok(screen.getByAltText(this.intl.t('common.french-republic')));
  });

  test('displays the student data policy', async function (assert) {
    // given & when
    const screen = await render(hbs`<Footer />}`);

    // then
    assert.ok(screen.getByRole('link', { name: this.intl.t('navigation.footer.student-data-protection-policy') }));
  });
});
