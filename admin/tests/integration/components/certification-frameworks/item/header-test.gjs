import { render, within } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import Header from 'pix-admin/components/certification-frameworks/item/header';
import { module, test } from 'qunit';

import setupIntlRenderingTest, { t } from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | certification-frameworks/item/header', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');

    class routerStub extends Service {
      currentRouteName = 'super.route';
    }
    this.owner.register('service:router', routerStub);
  });

  test('it should display the framework label in breadcrumb and title', async function (assert) {
    const currentUser = this.owner.lookup('service:currentUser');
    currentUser.adminMember = { isSuperAdmin: false };
    const certificationFramework = store.createRecord('certification-framework', { id: 'DROIT', name: 'DROIT' });
    // when
    const screen = await render(<template><Header @certificationFramework={{certificationFramework}} /></template>);

    // then
    const nav = screen.getByRole('navigation');
    assert.ok(within(nav).getByRole('link', { name: t('components.layout.sidebar.certification-frameworks') }));
    assert.ok(screen.getByRole('heading', { name: t('components.certification-frameworks.labels.DROIT'), level: 1 }));
  });

  module('#canCreateVersion', function () {
    test('it should display the create button when user is super admin and framework is not CLEA', async function (assert) {
      // given
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.adminMember = { isSuperAdmin: true };
      const certificationFramework = store.createRecord('certification-framework', { id: 'DROIT', name: 'DROIT' });

      // when
      const screen = await render(<template><Header @certificationFramework={{certificationFramework}} /></template>);

      // then
      assert.dom(screen.getByText(t('components.certification-frameworks.item.framework.create-button'))).exists();
    });

    test('it should not display the create button when user is not super admin', async function (assert) {
      // given
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.adminMember = { isSuperAdmin: false };
      const certificationFramework = store.createRecord('certification-framework', { id: 'DROIT', name: 'DROIT' });

      // when
      const screen = await render(<template><Header @certificationFramework={{certificationFramework}} /></template>);

      // then
      assert
        .dom(screen.queryByText(t('components.certification-frameworks.item.framework.create-button')))
        .doesNotExist();
    });

    test('it should not display the create button for CLEA even if user is super admin', async function (assert) {
      // given
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.adminMember = { isSuperAdmin: true };
      const cleaFramework = store.createRecord('certification-framework', { id: 'CLEA', name: 'CLEA' });

      // when
      const screen = await render(<template><Header @certificationFramework={{cleaFramework}} /></template>);

      // then
      assert
        .dom(screen.queryByText(t('components.certification-frameworks.item.framework.create-button')))
        .doesNotExist();
    });

    test('it should not display the create button on new version page', async function (assert) {
      // given
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.adminMember = { isSuperAdmin: true };
      const serviceRouter = this.owner.lookup('service:router');
      serviceRouter.currentRouteName = 'authenticated.certification-frameworks.item.framework.new-version';
      const certificationFramework = store.createRecord('certification-framework', { id: 'DROIT', name: 'DROIT' });

      // when
      const screen = await render(<template><Header @certificationFramework={{certificationFramework}} /></template>);

      // then
      assert
        .dom(
          screen.queryByRole('button', { name: t('components.certification-frameworks.item.framework.create-button') }),
        )
        .doesNotExist();
    });
  });
});
