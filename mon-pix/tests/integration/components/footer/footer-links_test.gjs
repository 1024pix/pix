import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { t } from 'ember-intl/test-support';
import FooterLinks from 'mon-pix/components/footer/footer-links';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | FooterLinks', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('displays the navigation menu with expected elements', async function (assert) {
    // when
    const screen = await render(<template><FooterLinks /></template>);

    // then
    assert.ok(screen.getByRole('link', { name: t('navigation.footer.a11y') }));
    assert.ok(screen.getByRole('link', { name: t('navigation.footer.data-protection-policy') }));
    assert.ok(screen.getByRole('link', { name: t('navigation.footer.eula') }));
    assert.ok(screen.getByRole('link', { name: t('navigation.footer.help-center') }));
    assert.ok(screen.getByRole('link', { name: t('navigation.footer.legal-notice') }));
    assert.ok(screen.getByRole('link', { name: t('navigation.footer.server-status') }));
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

    test('does not display the student data policy', async function (assert) {
      // when
      const screen = await render(<template><FooterLinks /></template>);

      // then
      assert
        .dom(screen.queryByRole('link', { name: t('navigation.footer.student-data-protection-policy') }))
        .doesNotExist();
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

    test('displays the student data policy', async function (assert) {
      // when
      const screen = await render(<template><FooterLinks /></template>);
      // then
      assert.dom(screen.getByRole('link', { name: t('navigation.footer.student-data-protection-policy') })).exists();
    });
  });
});
