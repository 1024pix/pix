import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import FooterLinks from 'mon-pix/components/footer/footer-links';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { stubCurrentUserService } from '../../../helpers/service-stubs';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Footer', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('displays a navigation with a list of links', async function (assert) {
    // when
    const screen = await render(<template><FooterLinks /></template>);

    // then
    assert.dom(screen.getByRole('navigation')).hasAttribute('aria-label', t('navigation.footer.label'));

    assert.ok(screen.getByRole('link', { name: t('navigation.footer.help-center') }));
    assert.ok(screen.getByRole('link', { name: t('navigation.footer.a11y') }));
    assert.ok(screen.getByRole('link', { name: t('navigation.footer.server-status') }));
    assert.ok(screen.getByRole('link', { name: t('navigation.footer.eula') }));
    assert.ok(screen.getByRole('link', { name: t('navigation.footer.legal-notice') }));
    assert.ok(screen.getByRole('link', { name: t('navigation.footer.data-protection-policy') }));
  });

  module('when user is connected', function (hooks) {
    hooks.beforeEach(function () {
      stubCurrentUserService(this.owner);
    });

    test('displays the sitemap link', async function (assert) {
      // when
      const screen = await render(<template><FooterLinks /></template>);

      // then
      assert.ok(screen.getByRole('link', { name: t('navigation.footer.sitemap') }));
    });
  });

  module('when url does not have frenchDomainExtension', function () {
    test('does not display the student data policy', async function (assert) {
      // when
      const screen = await render(<template><FooterLinks /></template>);

      // then
      assert
        .dom(screen.queryByRole('link', { name: t('navigation.footer.student-data-protection-policy') }))
        .doesNotExist();
    });
  });

  module('when url has frenchDomainExtension', function (hooks) {
    hooks.beforeEach(function () {
      const domainService = this.owner.lookup('service:currentDomain');
      sinon.stub(domainService, 'getExtension').returns('fr');
    });

    test('displays the student data policy', async function (assert) {
      // when
      const screen = await render(<template><FooterLinks /></template>);

      // then
      assert.dom(screen.getByRole('link', { name: t('navigation.footer.student-data-protection-policy') })).exists();
    });
  });

  module('component sizes', function () {
    module('when @size prop is not defined', function () {
      test('default size is small', async function (assert) {
        // when
        const screen = await render(<template><FooterLinks /></template>);

        // then
        assert.dom(screen.getByRole('list')).hasClass(/--small/);
      });
    });

    module('when @size prop is "extra-small"', function () {
      test('size is "extra-small"', async function (assert) {
        // when
        const screen = await render(<template><FooterLinks @size="extra-small" /></template>);

        // then
        assert.dom(screen.getByRole('list')).hasClass(/--extra-small/);
      });
    });
  });

  module('component text align', function () {
    module('when @textAlign prop is not defined', function () {
      test('there is no text align variant', async function (assert) {
        // when
        const screen = await render(<template><FooterLinks /></template>);

        // then
        assert.dom(screen.getByRole('list')).hasNoClass(/--align/);
      });
    });

    module('when @textAlign prop is "right"', function () {
      test('text align is "right"', async function (assert) {
        // when
        const screen = await render(<template><FooterLinks @textAlign="right" /></template>);

        // then
        assert.dom(screen.getByRole('list')).hasClass(/--align-right/);
      });
    });
  });
});
